import {
  hasMatchData,
  hasPitData,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

export type ProjectQuestionnaireKind = "match" | "pit";

export function projectSupportsQuestionnaireKind(
  project: Pick<ScoutingProjectDoc, "dataMode">,
  kind: ProjectQuestionnaireKind
): boolean {
  return kind === "match"
    ? hasMatchData(project.dataMode)
    : hasPitData(project.dataMode);
}

export function getProjectQuestionnaireId(
  project: Pick<ScoutingProjectDoc, "dataMode" | "activeQuestionnaireIds">,
  kind: ProjectQuestionnaireKind
): string | null {
  if (!projectSupportsQuestionnaireKind(project, kind)) {
    return null;
  }

  return project.activeQuestionnaireIds?.[kind] ?? null;
}

export function projectHasConfiguredQuestionnaire(
  project: Pick<ScoutingProjectDoc, "dataMode" | "activeQuestionnaireIds">,
  kind: ProjectQuestionnaireKind
): boolean {
  return (
    projectSupportsQuestionnaireKind(project, kind) &&
    Boolean(project.activeQuestionnaireIds?.[kind])
  );
}

export function getUnsupportedProjectQuestionnaireMessage(
  kind: ProjectQuestionnaireKind
): string {
  return kind === "match"
    ? "This scouting project does not have match scouting enabled."
    : "This scouting project does not have pit scouting enabled.";
}

export function getMissingProjectQuestionnaireMessage(
  kind: ProjectQuestionnaireKind
): string {
  return `No ${kind} scouting questionnaire has been set up for this project yet. The owner needs to choose the default template or start from scratch in the builder first.`;
}
