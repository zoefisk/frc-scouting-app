import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import { pitScoutingV1 } from "@/lib/scouting/questionnaire/builtins/pitScoutingV1";
import type { ProjectQuestionnaireKind } from "@/lib/scouting-projects/questionnaires/types";

function cloneDefinition(
  definition: QuestionnaireDefinition
): QuestionnaireDefinition {
  return JSON.parse(JSON.stringify(definition)) as QuestionnaireDefinition;
}

export function buildDefaultQuestionnaireTemplate(
  kind: ProjectQuestionnaireKind
): QuestionnaireDefinition {
  return cloneDefinition(kind === "match" ? matchScoutingV1 : pitScoutingV1);
}

export function buildScratchQuestionnaireTemplate(
  kind: ProjectQuestionnaireKind
): QuestionnaireDefinition {
  return {
    id: `${kind}-scouting-custom`,
    name: kind === "match" ? "Custom Match Scouting" : "Custom Pit Scouting",
    version: 1,
    description:
      kind === "match"
        ? "Build a custom match scouting questionnaire for this project."
        : "Build a custom pit scouting questionnaire for this project.",
    sections: [],
  };
}
