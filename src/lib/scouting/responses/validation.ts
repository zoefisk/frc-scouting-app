import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaire/validators";
import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";

export function validateResponseRecord(
  definition: QuestionnaireDefinition,
  answers: QuestionnaireAnswers
) {
  return validateQuestionnaireAnswers(definition, answers);
}
