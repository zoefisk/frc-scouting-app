import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaires/validators";
import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/responses/types";

export function validateResponseRecord(
  definition: QuestionnaireDefinition,
  answers: QuestionnaireAnswers
) {
  return validateQuestionnaireAnswers(definition, answers);
}
