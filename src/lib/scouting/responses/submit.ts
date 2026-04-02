import type { QuestionnaireResponseRecord } from "./types";
import { validateResponseRecord } from "./validation";
import { QuestionnaireDefinition } from "@/lib/scouting/questionnaires/schema";

type SubmitQuestionnaireResponseInput = Omit<
  QuestionnaireResponseRecord,
  "createdAt" | "updatedAt"
>;

export function buildQuestionnaireResponseRecord(
  definition: QuestionnaireDefinition,
  input: SubmitQuestionnaireResponseInput
): QuestionnaireResponseRecord {
  const now = new Date().toISOString();

  return {
    ...input,
    questionnaireId: definition.id,
    questionnaireVersion: definition.version,
    createdAt: now,
    updatedAt: now,
  };
}

export async function submitQuestionnaireResponse(
  definition: QuestionnaireDefinition,
  input: SubmitQuestionnaireResponseInput,
  save: (response: QuestionnaireResponseRecord) => Promise<void>
) {
  const errors = validateResponseRecord(definition, input.answers);

  if (Object.keys(errors).length > 0) {
    throw new Error("Questionnaire response failed validation.");
  }

  const response = buildQuestionnaireResponseRecord(definition, input);
  await save(response);

  return response;
}
