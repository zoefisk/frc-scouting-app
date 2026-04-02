// src/lib/scouting/questionnaires/schema.ts

import { z } from "zod";

/* ---------- Shared ---------- */

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const visibilityRuleSchema = z.object({
  fieldId: z.string(),
  equals: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

/* ---------- Base Field ---------- */

const baseFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  helpText: z.string().optional(),
  visibleWhen: visibilityRuleSchema.optional(),
});

/* ---------- Field Types ---------- */

const textFieldSchema = baseFieldSchema.extend({
  type: z.literal("text"),
  multiline: z.boolean().optional(),
  placeholder: z.string().optional(),
});

const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal("number"),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(optionSchema),
});

const booleanFieldSchema = baseFieldSchema.extend({
  type: z.literal("boolean"),
});

const ratingFieldSchema = baseFieldSchema.extend({
  type: z.literal("rating"),
  min: z.number(),
  max: z.number(),
});

/* ---------- Union ---------- */

export const fieldSchema = z.discriminatedUnion("type", [
  textFieldSchema,
  numberFieldSchema,
  selectFieldSchema,
  booleanFieldSchema,
  ratingFieldSchema,
]);

/* ---------- Section ---------- */

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
});

/* ---------- Questionnaire ---------- */

export const questionnaireSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
  description: z.string().optional(),
  sections: z.array(sectionSchema),
});

/* ---------- Types ---------- */

export type QuestionnaireSchema = z.infer<typeof questionnaireSchema>;
