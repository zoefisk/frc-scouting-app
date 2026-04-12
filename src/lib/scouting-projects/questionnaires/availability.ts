import type { ScoutingProjectDoc } from "@/lib/scouting-projects/types";

export type ProjectQuestionnaireKind = "match" | "pit";

export function projectHasConfiguredQuestionnaire(
  project: Pick<ScoutingProjectDoc, "formMode" | "activeQuestionnaireIds">,
  kind: ProjectQuestionnaireKind
): boolean {
  if (project.formMode !== "custom") {
    return true;
  }

  return Boolean(project.activeQuestionnaireIds?.[kind]);
}

export function getMissingProjectQuestionnaireMessage(
  kind: ProjectQuestionnaireKind
): string {
  return `This project uses a custom ${kind} scouting form, but no questionnaire has been created for it yet. Ask the project owner to build the ${kind} scouting questionnaire in project settings first.`;
}
