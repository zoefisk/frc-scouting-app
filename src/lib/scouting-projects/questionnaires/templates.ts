import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
import { matchScoutingAllianceV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingAllianceV1";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import { pitScoutingV1 } from "@/lib/scouting/questionnaire/builtins/pitScoutingV1";
import type { ProjectQuestionnaireKind } from "@/lib/scouting-projects/questionnaires/types";
import type { MatchCollectionMode } from "@/lib/scouting-projects/types";

function cloneDefinition(
  definition: QuestionnaireDefinition
): QuestionnaireDefinition {
  return JSON.parse(JSON.stringify(definition)) as QuestionnaireDefinition;
}

export function buildDefaultQuestionnaireTemplate(
  kind: ProjectQuestionnaireKind,
  options?: {
    matchCollectionMode?: MatchCollectionMode | null;
  }
): QuestionnaireDefinition {
  if (kind === "pit") {
    return cloneDefinition(pitScoutingV1);
  }

  return cloneDefinition(
    options?.matchCollectionMode === "alliance"
      ? matchScoutingAllianceV1
      : matchScoutingV1
  );
}

export function getDefaultQuestionnaireTemplateId(
  kind: ProjectQuestionnaireKind,
  options?: {
    matchCollectionMode?: MatchCollectionMode | null;
  }
): string {
  if (kind === "pit") {
    return pitScoutingV1.id;
  }

  return options?.matchCollectionMode === "alliance"
    ? matchScoutingAllianceV1.id
    : matchScoutingV1.id;
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
