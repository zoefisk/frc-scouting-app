// src/lib/scouting/questionnaires/registry.ts

import { matchScoutingV1 } from "./builtins/matchScoutingV1";
import { matchScoutingAllianceV1 } from "./builtins/matchScoutingAllianceV1";
import { pitScoutingV1 } from "./builtins/pitScoutingV1";
import { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

export const builtInQuestionnaires: QuestionnaireDefinition[] = [
  matchScoutingV1,
  matchScoutingAllianceV1,
  pitScoutingV1,
];

export function getBuiltInQuestionnaireById(
  id: string
): QuestionnaireDefinition | undefined {
  return builtInQuestionnaires.find((questionnaire) => questionnaire.id === id);
}

export function getBuiltInQuestionnaireByIdAndVersion(
  id: string,
  version: number
): QuestionnaireDefinition | undefined {
  return builtInQuestionnaires.find(
    (questionnaire) =>
      questionnaire.id === id && questionnaire.version === version
  );
}
