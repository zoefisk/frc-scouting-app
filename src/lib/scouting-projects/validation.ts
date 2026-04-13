import { z } from "zod";
import { hasMatchData } from "@/lib/scouting-projects/types";

export const MIN_SCOUTING_PROJECT_YEAR = 2015;
export const MIN_SCOUTING_PROJECT_NAME_LENGTH = 5;
export const MAX_SCOUTING_PROJECT_NAME_LENGTH = 100;
export const MAX_SCOUTING_PROJECT_YEAR = new Date().getFullYear();

export const projectAccessModeSchema = z.enum(["anonymous", "authenticated"]);
export const projectDataModeSchema = z.enum(["match", "pit", "both"]);
export const projectMatchCollectionModeSchema = z.enum(["robot", "alliance"]);
export const createScoutingProjectInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required.")
      .min(
        MIN_SCOUTING_PROJECT_NAME_LENGTH,
        `Project name must be at least ${MIN_SCOUTING_PROJECT_NAME_LENGTH} characters.`
      )
      .max(
        MAX_SCOUTING_PROJECT_NAME_LENGTH,
        `Project name must be ${MAX_SCOUTING_PROJECT_NAME_LENGTH} characters or fewer.`
      ),

    eventKey: z
      .string()
      .trim()
      .min(1, "Event key is required.")
      .max(64, "Event key is too long."),

    year: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Year is required."
            : "Year must be a number.",
      })
      .int("Year must be a whole number.")
      .min(
        MIN_SCOUTING_PROJECT_YEAR,
        `Year cannot be earlier than ${MIN_SCOUTING_PROJECT_YEAR}.`
      )
      .max(
        MAX_SCOUTING_PROJECT_YEAR,
        `Year cannot be later than ${MAX_SCOUTING_PROJECT_YEAR}.`
      ),

    teamKeys: z
      .array(z.string().trim().min(1))
      .min(1, "Select at least one team.")
      .max(200, "Too many teams selected."),

    accessMode: projectAccessModeSchema,

    dataMode: projectDataModeSchema,

    matchCollectionMode: projectMatchCollectionModeSchema.nullable(),
  })
  .superRefine((data, ctx) => {
    const usesMatchData = hasMatchData(data.dataMode);

    if (usesMatchData && data.matchCollectionMode == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matchCollectionMode"],
        message:
          "Match collection mode is required when match scouting is enabled.",
      });
    }

    if (!usesMatchData && data.matchCollectionMode != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matchCollectionMode"],
        message:
          "Match collection mode must be empty when match scouting is not enabled.",
      });
    }
  });

export type CreateScoutingProjectInput = z.infer<
  typeof createScoutingProjectInputSchema
>;

export function validateCreateScoutingProjectInput(
  input: unknown
): CreateScoutingProjectInput {
  return createScoutingProjectInputSchema.parse(input);
}

export type CreateScoutingProjectFieldErrorKey =
  | keyof CreateScoutingProjectInput
  | "teamKeys";

export function mapCreateScoutingProjectIssuesToFieldErrors(
  issues: z.ZodIssue[]
): Partial<Record<CreateScoutingProjectFieldErrorKey, string>> {
  const nextErrors: Partial<
    Record<CreateScoutingProjectFieldErrorKey, string>
  > = {};

  for (const issue of issues) {
    const path = issue.path[0];

    if (path === "teamKeys") {
      nextErrors.teamKeys = issue.message;
    } else if (
      path === "name" ||
      path === "eventKey" ||
      path === "year" ||
      path === "accessMode" ||
      path === "dataMode" ||
      path === "matchCollectionMode"
    ) {
      nextErrors[path] = issue.message;
    }
  }

  return nextErrors;
}
