import { z } from "zod";

/* ---------- Shared ---------- */

export const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const visibilityOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "in",
  "notIn",
  "isTruthy",
  "isFalsy",
]);

const visibilityValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const visibilityRuleSchema = z.object({
  fieldId: z.string(),
  operator: visibilityOperatorSchema,
  value: z
    .union([visibilityValueSchema, z.array(visibilityValueSchema)])
    .optional(),
});

type VisibilityConditionGroupShape = {
  mode: "all" | "any";
  rules: Array<
    z.infer<typeof visibilityRuleSchema> | VisibilityConditionGroupShape
  >;
};

export const visibilityConditionGroupSchema: z.ZodType<VisibilityConditionGroupShape> =
  z.lazy(() =>
    z.object({
      mode: z.enum(["all", "any"]),
      rules: z.array(
        z.union([visibilityRuleSchema, visibilityConditionGroupSchema])
      ),
    })
  );

/* ---------- Base Field ---------- */

const baseFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  helpText: z.string().optional(),
  visibleWhen: visibilityConditionGroupSchema.optional(),
});

/* ---------- Field Types ---------- */

export const textFieldSchema = baseFieldSchema.extend({
  type: z.literal("text"),
  multiline: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal("number"),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(optionSchema),
});

export const booleanFieldSchema = baseFieldSchema.extend({
  type: z.literal("boolean"),
});

export const ratingFieldSchema = baseFieldSchema.extend({
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
