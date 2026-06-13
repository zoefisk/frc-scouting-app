import { getProjectQuestionnaireClient } from "@/lib/firebase/client/questionnaires";
import {
  saveMatchScoutingEntry,
  savePitScoutingEntry,
} from "@/lib/firebase/client/entries";
import { getBuiltInQuestionnaireById } from "@/lib/scouting/questionnaire/registry";
import {
  getAlliancePerfFieldId,
  PERF_FIELDS,
} from "@/lib/scouting/performanceRatings";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
  QuestionnaireFieldDefinition,
} from "@/lib/scouting/questionnaire/types";

export type ImportedQuestionnairePayload = {
  v: number;
  type: "questionnaire_response";
  entryId: string;
  projectId: string | null;
  eventKey: string;
  matchNumber: number | null;
  scoutingPosition: string | null;
  teamPresence: string | null;
  teamKey: string | null;
  teamNumber: number | null;
  teamName: string;
  selectedTeamKey: string | null;
  questionnaire: {
    id: string;
    name: string;
    version: number;
  };
  setup: {
    kind: "match" | "pit";
    projectId: string | null;
    eventKey: string;
    matchCollectionMode?: "robot" | "alliance" | null;
    matchNumber: number | null;
    scoutingPosition: string | null;
    teamPresence: string | null;
    teamKey: string | null;
    teamNumber: number | null;
    teamName: string;
    allianceTeams?: Array<{
      slot: number;
      teamKey: string | null;
      teamNumber: number | null;
      teamName: string;
      teamPresence: string | null;
      robotPosition: string | null;
    }>;
  };
  answers: QuestionnaireAnswers;
  savedAt: string;
};

export function buildImportedQuestionnaireDuplicateKey(
  payload: ImportedQuestionnairePayload
): string {
  const projectId = payload.projectId ?? payload.setup.projectId ?? "";
  const questionnaireId = payload.questionnaire.id.trim();
  const eventKey = payload.eventKey.trim();
  const teamKey = (payload.teamKey ?? payload.setup.teamKey ?? "").trim();

  if (payload.setup.kind === "pit") {
    return ["pit", projectId, eventKey, teamKey, questionnaireId].join("|");
  }

  const matchNumber = payload.matchNumber ?? payload.setup.matchNumber ?? "";
  const scoutingPosition = (
    payload.scoutingPosition ??
    payload.setup.scoutingPosition ??
    ""
  ).trim();

  return [
    "match",
    projectId,
    eventKey,
    String(matchNumber),
    scoutingPosition,
    teamKey,
    questionnaireId,
  ].join("|");
}

const METADATA_FIELDS = new Set([
  "kind",
  "projectId",
  "questionnaireId",
  "questionnaireName",
  "questionnaireVersion",
  "eventKey",
  "matchNumber",
  "scoutingPosition",
  "teamPresence",
  "teamKey",
  "teamNumber",
  "teamName",
  "savedAt",
]);

function generateEntryId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildDerivedTeamKey(teamNumber: number | null): string | null {
  return Number.isFinite(teamNumber) ? `frc${teamNumber}` : null;
}

function normalizeImportedAllianceTeams(
  rawAllianceTeams: unknown
): ImportedQuestionnairePayload["setup"]["allianceTeams"] {
  if (!Array.isArray(rawAllianceTeams)) {
    return [];
  }

  return rawAllianceTeams.map((entry, index) => {
    const record =
      entry && typeof entry === "object"
        ? (entry as Record<string, unknown>)
        : {};
    const teamNumber = Number(record.teamNumber);
    const normalizedTeamNumber = Number.isFinite(teamNumber)
      ? teamNumber
      : null;

    return {
      slot: Number(record.slot) || index + 1,
      teamKey:
        typeof record.teamKey === "string" && record.teamKey.trim()
          ? record.teamKey.trim()
          : buildDerivedTeamKey(normalizedTeamNumber),
      teamNumber: normalizedTeamNumber,
      teamName: String(
        record.teamName ??
          (normalizedTeamNumber != null ? `Team ${normalizedTeamNumber}` : "")
      ),
      teamPresence:
        typeof record.teamPresence === "string" ? record.teamPresence : null,
      robotPosition:
        typeof record.robotPosition === "string" ? record.robotPosition : null,
    };
  });
}

function buildAnswersForImportedAllianceTeam(
  answers: QuestionnaireAnswers,
  teamKey: string
): QuestionnaireAnswers {
  const nextAnswers: QuestionnaireAnswers = { ...answers };

  for (const field of PERF_FIELDS) {
    const teamSpecificValue =
      answers[getAlliancePerfFieldId(teamKey, field.id)];

    if (typeof teamSpecificValue === "number") {
      nextAnswers[field.id] = teamSpecificValue;
    } else {
      delete nextAnswers[field.id];
    }
  }

  return nextAnswers;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function coerceBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "0"].includes(normalized)) {
    return false;
  }
  return null;
}

function coerceFieldValue(
  rawValue: string,
  field: QuestionnaireFieldDefinition | undefined
): unknown {
  if (rawValue === "") {
    return "";
  }

  if (!field) {
    const booleanValue = coerceBoolean(rawValue);
    if (booleanValue != null) {
      return booleanValue;
    }

    const numericValue = Number(rawValue);
    return Number.isFinite(numericValue) ? numericValue : rawValue;
  }

  if (field.type === "boolean") {
    return coerceBoolean(rawValue) ?? false;
  }

  if (field.type === "number" || field.type === "rating") {
    const numericValue = Number(rawValue);
    return Number.isFinite(numericValue) ? numericValue : rawValue;
  }

  return rawValue;
}

async function resolveQuestionnaireDefinition(
  questionnaireId: string
): Promise<QuestionnaireDefinition | null> {
  const builtIn = getBuiltInQuestionnaireById(questionnaireId);
  if (builtIn) {
    return builtIn;
  }

  const custom = await getProjectQuestionnaireClient(questionnaireId);
  return custom?.definition ?? null;
}

function normalizeRawJsonPayload(
  payload: Record<string, unknown>,
  fallbackProjectId?: string
): ImportedQuestionnairePayload {
  if (payload.type !== "questionnaire_response") {
    throw new Error("Imported JSON is not a questionnaire response.");
  }

  const setup = (payload.setup ?? {}) as Record<string, unknown>;
  const questionnaire = (payload.questionnaire ?? {}) as Record<
    string,
    unknown
  >;
  const kind = setup.kind;

  if (kind !== "match" && kind !== "pit") {
    throw new Error("Imported entry must be either match or pit scouting.");
  }

  const eventKey = String(payload.eventKey ?? setup.eventKey ?? "").trim();
  if (!eventKey) {
    throw new Error("Imported entry is missing an event key.");
  }

  const teamKey = String(
    payload.teamKey ?? payload.selectedTeamKey ?? setup.teamKey ?? ""
  ).trim();
  if (!teamKey) {
    throw new Error("Imported entry is missing a team key.");
  }

  const rawMatchNumber = payload.matchNumber ?? setup.matchNumber ?? null;
  const numericMatchNumber =
    rawMatchNumber == null || rawMatchNumber === ""
      ? null
      : Number(rawMatchNumber);
  const matchCollectionMode =
    setup.matchCollectionMode === "alliance" ? "alliance" : "robot";
  const allianceTeams = normalizeImportedAllianceTeams(setup.allianceTeams);
  const teamNumber = Number(payload.teamNumber ?? setup.teamNumber);
  const normalizedTeamNumber = Number.isFinite(teamNumber) ? teamNumber : null;

  return {
    v: typeof payload.v === "number" ? payload.v : 1,
    type: "questionnaire_response",
    entryId: String(
      payload.entryId ?? payload.submissionId ?? generateEntryId()
    ),
    projectId:
      String(
        payload.projectId ?? setup.projectId ?? fallbackProjectId ?? ""
      ).trim() || null,
    eventKey,
    matchNumber: Number.isFinite(numericMatchNumber)
      ? numericMatchNumber
      : null,
    scoutingPosition:
      typeof payload.scoutingPosition === "string"
        ? payload.scoutingPosition
        : typeof setup.scoutingPosition === "string"
          ? String(setup.scoutingPosition)
          : null,
    teamPresence:
      typeof payload.teamPresence === "string"
        ? payload.teamPresence
        : typeof setup.teamPresence === "string"
          ? String(setup.teamPresence)
          : null,
    teamKey,
    teamNumber: normalizedTeamNumber,
    teamName: String(payload.teamName ?? setup.teamName ?? teamKey),
    selectedTeamKey: teamKey,
    questionnaire: {
      id: String(questionnaire.id ?? ""),
      name: String(questionnaire.name ?? "Imported Questionnaire"),
      version: Number(questionnaire.version ?? 1),
    },
    setup: {
      kind,
      projectId:
        String(
          setup.projectId ?? payload.projectId ?? fallbackProjectId ?? ""
        ).trim() || null,
      eventKey,
      matchCollectionMode,
      matchNumber:
        Number.isFinite(numericMatchNumber) && kind === "match"
          ? numericMatchNumber
          : null,
      scoutingPosition:
        typeof setup.scoutingPosition === "string"
          ? String(setup.scoutingPosition)
          : typeof payload.scoutingPosition === "string"
            ? payload.scoutingPosition
            : null,
      teamPresence:
        typeof setup.teamPresence === "string"
          ? String(setup.teamPresence)
          : typeof payload.teamPresence === "string"
            ? payload.teamPresence
            : null,
      teamKey,
      teamNumber: normalizedTeamNumber,
      teamName: String(payload.teamName ?? setup.teamName ?? teamKey),
      allianceTeams,
    },
    answers:
      typeof payload.answers === "object" && payload.answers != null
        ? (payload.answers as QuestionnaireAnswers)
        : {},
    savedAt:
      typeof payload.savedAt === "string"
        ? payload.savedAt
        : new Date().toISOString(),
  };
}

function parseAllianceTeamCsvEntry(
  record: Record<string, string>,
  slot: number
): ImportedQuestionnairePayload["setup"]["allianceTeams"][number] | null {
  const explicitTeamKey = String(record[`allianceTeam${slot}Key`] ?? "").trim();
  const explicitTeamNumber = Number(record[`allianceTeam${slot}Number`] ?? "");
  const fallbackLabel = String(record[`allianceTeam${slot}`] ?? "").trim();
  const fallbackMatch = fallbackLabel.match(/^#(\d+)\s*(.*)$/);
  const teamNumber = Number.isFinite(explicitTeamNumber)
    ? explicitTeamNumber
    : fallbackMatch
      ? Number(fallbackMatch[1])
      : null;
  const teamKey = explicitTeamKey || buildDerivedTeamKey(teamNumber) || null;
  const teamName = String(
    record[`allianceTeam${slot}Name`] ??
      (fallbackMatch?.[2]?.trim() || fallbackLabel || "")
  ).trim();

  if (!teamKey && teamNumber == null && !teamName) {
    return null;
  }

  return {
    slot,
    teamKey,
    teamNumber,
    teamName: teamName || (teamNumber != null ? `Team ${teamNumber}` : ""),
    teamPresence:
      String(record[`allianceTeam${slot}Presence`] ?? "").trim() || null,
    robotPosition:
      String(record[`allianceTeam${slot}Position`] ?? "").trim() || null,
  };
}

async function parseCsvPayload(
  csvText: string,
  fallbackProjectId?: string
): Promise<ImportedQuestionnairePayload> {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV import requires a header row and a value row.");
  }

  const headers = parseCsvLine(lines[0]);
  const values = parseCsvLine(lines[1]);

  if (headers.length !== values.length) {
    throw new Error("CSV headers and values do not line up.");
  }

  const record = Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? ""])
  );
  const questionnaireId = String(record.questionnaireId ?? "").trim();
  if (!questionnaireId) {
    throw new Error("CSV import is missing questionnaireId.");
  }

  const questionnaireDefinition =
    await resolveQuestionnaireDefinition(questionnaireId);
  const fieldMap = new Map<string, QuestionnaireFieldDefinition>();
  questionnaireDefinition?.sections.forEach((section) => {
    section.fields.forEach((field) => {
      fieldMap.set(field.id, field);
    });
  });

  const kindValue = String(record.kind ?? "").trim();
  const kind =
    kindValue === "match" || kindValue === "pit"
      ? kindValue
      : questionnaireId.includes("pit")
        ? "pit"
        : "match";
  const matchCollectionMode =
    String(record.matchCollectionMode ?? "").trim() === "alliance"
      ? "alliance"
      : "robot";

  const answers: QuestionnaireAnswers = {};
  for (const [key, value] of Object.entries(record)) {
    if (METADATA_FIELDS.has(key)) {
      continue;
    }

    answers[key] = coerceFieldValue(value, fieldMap.get(key));
  }

  const teamKey = String(record.teamKey ?? "").trim();
  const eventKey = String(record.eventKey ?? "").trim();
  const rawMatchNumber = String(record.matchNumber ?? "").trim();
  const numericMatchNumber =
    rawMatchNumber === "" ? null : Number(rawMatchNumber);
  const allianceTeams =
    matchCollectionMode === "alliance"
      ? [1, 2, 3]
          .map((slot) => parseAllianceTeamCsvEntry(record, slot))
          .filter(Boolean)
      : [];

  const fallbackTeamNumber = allianceTeams[0]?.teamNumber ?? null;
  const fallbackTeamKey = allianceTeams[0]?.teamKey ?? "";

  if (!eventKey) {
    throw new Error("CSV import is missing eventKey.");
  }

  if (matchCollectionMode !== "alliance" && !teamKey) {
    throw new Error("CSV import is missing teamKey.");
  }

  if (matchCollectionMode === "alliance" && allianceTeams.length === 0) {
    throw new Error("Alliance-mode CSV import is missing alliance team data.");
  }

  return {
    v: 1,
    type: "questionnaire_response",
    entryId: generateEntryId(),
    projectId:
      String(record.projectId ?? fallbackProjectId ?? "").trim() || null,
    eventKey,
    matchNumber:
      kind === "match" && Number.isFinite(numericMatchNumber)
        ? numericMatchNumber
        : null,
    scoutingPosition:
      kind === "match"
        ? String(record.scoutingPosition ?? "").trim() || null
        : null,
    teamPresence: String(record.teamPresence ?? "").trim() || null,
    teamKey: teamKey || fallbackTeamKey || null,
    teamNumber: Number.isFinite(Number(record.teamNumber))
      ? Number(record.teamNumber)
      : fallbackTeamNumber,
    teamName: String(record.teamName ?? allianceTeams[0]?.teamName ?? teamKey),
    selectedTeamKey: teamKey || fallbackTeamKey || null,
    questionnaire: {
      id: questionnaireId,
      name: String(
        record.questionnaireName ??
          questionnaireDefinition?.name ??
          questionnaireId
      ),
      version: Number(
        record.questionnaireVersion ?? questionnaireDefinition?.version ?? 1
      ),
    },
    setup: {
      kind,
      projectId:
        String(record.projectId ?? fallbackProjectId ?? "").trim() || null,
      eventKey,
      matchCollectionMode,
      matchNumber:
        kind === "match" && Number.isFinite(numericMatchNumber)
          ? numericMatchNumber
          : null,
      scoutingPosition:
        kind === "match"
          ? String(record.scoutingPosition ?? "").trim() || null
          : null,
      teamPresence: String(record.teamPresence ?? "").trim() || null,
      teamKey: teamKey || fallbackTeamKey || null,
      teamNumber: Number.isFinite(Number(record.teamNumber))
        ? Number(record.teamNumber)
        : fallbackTeamNumber,
      teamName: String(
        record.teamName ?? allianceTeams[0]?.teamName ?? teamKey
      ),
      allianceTeams,
    },
    answers,
    savedAt: String(record.savedAt ?? new Date().toISOString()),
  };
}

function expandImportedQuestionnairePayload(
  payload: ImportedQuestionnairePayload
): ImportedQuestionnairePayload[] {
  if (
    payload.setup.kind !== "match" ||
    payload.setup.matchCollectionMode !== "alliance"
  ) {
    return [payload];
  }

  const allianceTeams = (payload.setup.allianceTeams ?? []).filter(
    (team) => team.teamKey || team.teamNumber != null
  );

  if (allianceTeams.length === 0) {
    return [payload];
  }

  return allianceTeams.map((team, index) => {
    const resolvedTeamKey =
      team.teamKey ?? buildDerivedTeamKey(team.teamNumber) ?? null;
    const entryIdBase = payload.entryId || generateEntryId();

    return {
      ...payload,
      entryId:
        resolvedTeamKey != null
          ? `${entryIdBase}-${resolvedTeamKey}`
          : `${entryIdBase}-${index + 1}`,
      teamKey: resolvedTeamKey,
      teamNumber: team.teamNumber,
      teamName: team.teamName,
      selectedTeamKey: resolvedTeamKey,
      teamPresence: team.teamPresence,
      setup: {
        ...payload.setup,
        teamKey: resolvedTeamKey,
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        teamPresence: team.teamPresence,
      },
      answers:
        resolvedTeamKey != null
          ? buildAnswersForImportedAllianceTeam(
              payload.answers,
              resolvedTeamKey
            )
          : payload.answers,
    };
  });
}

export async function normalizeImportedQuestionnaireTexts(
  rawText: string,
  fallbackProjectId?: string
): Promise<ImportedQuestionnairePayload[]> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("Import text is empty.");
  }

  if (trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (
      parsed.type === "questionnaire_response_batch" &&
      Array.isArray(parsed.entries)
    ) {
      return parsed.entries.flatMap((entry) =>
        expandImportedQuestionnairePayload(
          normalizeRawJsonPayload(
            (entry ?? {}) as Record<string, unknown>,
            fallbackProjectId
          )
        )
      );
    }

    return expandImportedQuestionnairePayload(
      normalizeRawJsonPayload(parsed, fallbackProjectId)
    );
  }

  return expandImportedQuestionnairePayload(
    await parseCsvPayload(trimmed, fallbackProjectId)
  );
}

export async function normalizeImportedQuestionnaireText(
  rawText: string,
  fallbackProjectId?: string
): Promise<ImportedQuestionnairePayload> {
  const payloads = await normalizeImportedQuestionnaireTexts(
    rawText,
    fallbackProjectId
  );

  if (payloads.length === 0) {
    throw new Error("Import text did not contain any scouting entries.");
  }

  return payloads[0];
}

export async function uploadImportedQuestionnairePayload(
  payload: ImportedQuestionnairePayload
): Promise<void> {
  if (payload.setup.kind === "pit") {
    if (!payload.setup.teamKey) {
      throw new Error("Pit scouting import is missing team key.");
    }

    await savePitScoutingEntry({
      eventKey: payload.eventKey,
      teamKey: payload.setup.teamKey,
      entryId: payload.entryId,
      payload,
    });
    return;
  }

  if (!Number.isFinite(payload.matchNumber)) {
    throw new Error("Match scouting import is missing a numeric match number.");
  }

  const matchNumber = Number(payload.matchNumber);

  await saveMatchScoutingEntry({
    eventKey: payload.eventKey,
    matchNumber,
    entryId: payload.entryId,
    payload,
  });
}
