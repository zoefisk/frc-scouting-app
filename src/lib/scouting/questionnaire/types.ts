import type { z } from "zod";
import {
  booleanFieldSchema,
  fieldSchema,
  numberFieldSchema,
  questionnaireSchema,
  ratingFieldSchema,
  sectionSchema,
  selectFieldSchema,
  textFieldSchema,
} from "@/lib/scouting/questionnaire/schema";

export type QuestionnaireFieldDefinition = z.infer<typeof fieldSchema>;
export type QuestionnaireSectionDefinition = z.infer<typeof sectionSchema>;
export type QuestionnaireDefinition = z.infer<typeof questionnaireSchema>;

export type TextFieldDefinition = z.infer<typeof textFieldSchema>;
export type NumberFieldDefinition = z.infer<typeof numberFieldSchema>;
export type SelectFieldDefinition = z.infer<typeof selectFieldSchema>;
export type BooleanFieldDefinition = z.infer<typeof booleanFieldSchema>;
export type RatingFieldDefinition = z.infer<typeof ratingFieldSchema>;

export type QuestionnaireAnswers = Record<string, unknown>;

export type QuestionnaireResponse = {
  questionnaireId: string;
  questionnaireVersion: number;
  answers: QuestionnaireAnswers;
};

export type VisibilityOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "isTruthy"
  | "isFalsy";

export type VisibilityRule = {
  fieldId: string;
  operator: VisibilityOperator;
  value?:
    | string
    | number
    | boolean
    | null
    | Array<string | number | boolean | null>;
};

export type VisibilityConditionGroup = {
  mode: "all" | "any";
  rules: Array<VisibilityRule | VisibilityConditionGroup>;
};
