// src/lib/scouting-projects/questionnaires/validation.ts

import { z } from "zod";
import { questionnaireSchema } from "@/lib/scouting/questionnaire/schema";

export const projectQuestionnaireKindSchema = z.enum(["match", "pit"]);
export const projectQuestionnaireSourceSchema = z.enum(["builtin", "custom"]);

export const createProjectQuestionnaireInputSchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required."),

  kind: projectQuestionnaireKindSchema,

  name: z
    .string()
    .trim()
    .min(1, "Questionnaire name is required.")
    .max(120, "Questionnaire name must be 120 characters or fewer."),

  version: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Version is required."
          : "Version must be a number.",
    })
    .int("Version must be a whole number.")
    .min(1, "Version must be at least 1."),

  isActive: z.boolean().optional().default(false),

  source: projectQuestionnaireSourceSchema.optional().default("custom"),

  basedOnQuestionnaireId: z.string().trim().nullable().optional(),

  definition: questionnaireSchema,
});

export type CreateProjectQuestionnaireInput = z.infer<
  typeof createProjectQuestionnaireInputSchema
>;

export function validateCreateProjectQuestionnaireInput(
  input: unknown
): CreateProjectQuestionnaireInput {
  return createProjectQuestionnaireInputSchema.parse(input);
}
