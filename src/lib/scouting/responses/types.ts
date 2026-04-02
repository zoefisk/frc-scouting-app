import type { z } from "zod";
import { fieldSchema, questionnaireSchema, sectionSchema } from "./schema";

export type QuestionnaireFieldDefinition = z.infer<typeof fieldSchema>;
export type QuestionnaireSectionDefinition = z.infer<typeof sectionSchema>;
export type QuestionnaireDefinition = z.infer<typeof questionnaireSchema>;

export type QuestionnaireAnswers = Record<string, unknown>;

export type QuestionnaireResponse = {
  questionnaireId: string;
  questionnaireVersion: number;
  answers: QuestionnaireAnswers;
};
