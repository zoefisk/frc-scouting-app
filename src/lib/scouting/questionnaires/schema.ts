import { z } from "zod";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const baseFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  helpText: z.string().optional(),
});

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

export const fieldSchema = z.discriminatedUnion("type", [
  textFieldSchema,
  numberFieldSchema,
  selectFieldSchema,
  booleanFieldSchema,
]);

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  fields: z.array(fieldSchema),
});

export const questionnaireSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
  sections: z.array(sectionSchema),
});
