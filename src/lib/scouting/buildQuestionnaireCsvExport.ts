import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
  QuestionnaireFieldDefinition,
} from "@/lib/scouting/questionnaire/types";
import { ScoutingSetupState } from "@/components/scouting/submission/types";

type CsvExportArgs = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: ScoutingSetupState;
};

function escapeCsvValue(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getAllFields(
  questionnaire: QuestionnaireDefinition
): QuestionnaireFieldDefinition[] {
  return questionnaire.sections.flatMap((section) => section.fields);
}

export function isQuestionnaireSetupComplete(
  setup: ScoutingSetupState
): boolean {
  if (!setup.eventKey) {
    return false;
  }

  if (setup.kind === "pit") {
    return setup.selectedTeam != null;
  }

  if (!setup.matchNumber || !setup.scoutingPosition) {
    return false;
  }

  if (setup.matchCollectionMode === "alliance") {
    return (setup.allianceTeams ?? []).length === 3;
  }

  return setup.selectedTeam != null;
}

export function buildQuestionnaireCsvExport({
  questionnaire,
  answers,
  setup,
}: CsvExportArgs): {
  csv: string;
  fileName: string;
} {
  const fields = getAllFields(questionnaire);

  const metadataEntries: Array<[string, unknown]> = [
    ["kind", setup.kind],
    ["projectId", setup.projectId ?? ""],
    ["questionnaireId", questionnaire.id],
    ["questionnaireName", questionnaire.name],
    ["questionnaireVersion", questionnaire.version],
    ["eventKey", setup.eventKey],
    ["matchCollectionMode", setup.matchCollectionMode ?? ""],
    ["teamKey", setup.selectedTeam?.key ?? ""],
    ["teamNumber", setup.selectedTeam?.team_number ?? ""],
    [
      "teamName",
      setup.selectedTeam?.nickname ??
        setup.selectedTeam?.name ??
        setup.selectedTeam?.key ??
        "",
    ],
    ["savedAt", new Date().toISOString()],
  ];

  if (setup.matchNumber) {
    metadataEntries.splice(5, 0, ["matchNumber", setup.matchNumber]);
  }

  if (setup.scoutingPosition) {
    metadataEntries.splice(setup.matchNumber ? 6 : 5, 0, [
      "scoutingPosition",
      setup.scoutingPosition,
    ]);
  }

  if (setup.teamPresence) {
    metadataEntries.push(["teamPresence", setup.teamPresence]);
  }

  if (setup.matchCollectionMode === "alliance") {
    for (const team of setup.allianceTeams ?? []) {
      metadataEntries.push([
        `allianceTeam${team.slot}`,
        team.team
          ? `#${team.team.team_number} ${
              team.team.nickname ?? team.team.name ?? team.team.key
            }`
          : "",
      ]);
      metadataEntries.push([
        `allianceTeam${team.slot}Key`,
        team.team?.key ?? "",
      ]);
      metadataEntries.push([
        `allianceTeam${team.slot}Number`,
        team.team?.team_number ?? "",
      ]);
      metadataEntries.push([
        `allianceTeam${team.slot}Name`,
        team.team?.nickname ?? team.team?.name ?? team.team?.key ?? "",
      ]);
      metadataEntries.push([
        `allianceTeam${team.slot}Presence`,
        team.teamPresence,
      ]);
      metadataEntries.push([
        `allianceTeam${team.slot}Position`,
        team.robotPosition ?? "",
      ]);
    }
  }

  const answerEntries: Array<[string, unknown]> = fields.map((field) => [
    field.id,
    answers[field.id] ?? "",
  ]);

  const allEntries = [...metadataEntries, ...answerEntries];
  const headers = allEntries.map(([key]) => key);
  const values = allEntries.map(([, value]) => value);

  const csv = [
    headers.map(escapeCsvValue).join(","),
    values.map(escapeCsvValue).join(","),
  ].join("\n");

  const teamLabel = setup.selectedTeam?.team_number
    ? `team-${setup.selectedTeam.team_number}`
    : setup.matchCollectionMode === "alliance"
      ? (setup.scoutingPosition ?? "alliance")
      : "team";
  const matchLabel = setup.matchNumber || setup.kind;

  const fileName = `${questionnaire.id}-${setup.eventKey}-${matchLabel}-${teamLabel}.csv`;

  return { csv, fileName };
}
