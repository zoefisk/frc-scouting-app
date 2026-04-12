import { getProjectQuestionnaireClient } from "@/lib/firebase/client/questionnaires";
import {
  saveMatchScoutingEntry,
  savePitScoutingEntry,
} from "@/lib/firebase/client/entries";
import { getBuiltInQuestionnaireById } from "@/lib/scouting/questionnaire/registry";
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
    matchNumber: number | null;
    scoutingPosition: string | null;
    teamPresence: string | null;
    teamKey: string | null;
    teamNumber: number | null;
    teamName: string;
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
    teamNumber: Number.isFinite(Number(payload.teamNumber ?? setup.teamNumber))
      ? Number(payload.teamNumber ?? setup.teamNumber)
      : null,
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
      teamNumber: Number.isFinite(
        Number(payload.teamNumber ?? setup.teamNumber)
      )
        ? Number(payload.teamNumber ?? setup.teamNumber)
        : null,
      teamName: String(payload.teamName ?? setup.teamName ?? teamKey),
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

  if (!teamKey || !eventKey) {
    throw new Error("CSV import is missing teamKey or eventKey.");
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
    teamKey,
    teamNumber: Number.isFinite(Number(record.teamNumber))
      ? Number(record.teamNumber)
      : null,
    teamName: String(record.teamName ?? teamKey),
    selectedTeamKey: teamKey,
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
      matchNumber:
        kind === "match" && Number.isFinite(numericMatchNumber)
          ? numericMatchNumber
          : null,
      scoutingPosition:
        kind === "match"
          ? String(record.scoutingPosition ?? "").trim() || null
          : null,
      teamPresence: String(record.teamPresence ?? "").trim() || null,
      teamKey,
      teamNumber: Number.isFinite(Number(record.teamNumber))
        ? Number(record.teamNumber)
        : null,
      teamName: String(record.teamName ?? teamKey),
    },
    answers,
    savedAt: String(record.savedAt ?? new Date().toISOString()),
  };
}

export async function normalizeImportedQuestionnaireText(
  rawText: string,
  fallbackProjectId?: string
): Promise<ImportedQuestionnairePayload> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("Import text is empty.");
  }

  if (trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return normalizeRawJsonPayload(parsed, fallbackProjectId);
  }

  return parseCsvPayload(trimmed, fallbackProjectId);
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
