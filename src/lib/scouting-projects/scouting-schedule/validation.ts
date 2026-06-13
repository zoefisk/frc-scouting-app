import { z } from "zod";
import type {
  ScoutingScheduleBlockSize,
  ScoutingScheduleEntry,
  ScoutingScheduleMode,
} from "@/lib/scouting-projects/types";
import {
  SCOUTING_SCHEDULE_BLOCK_SIZE_OPTIONS,
  getScoutingScheduleBlockSize,
} from "@/lib/scouting-projects/types";

export const MIN_SCOUTER_NAME_LENGTH = 1;
export const MAX_SCOUTER_NAME_LENGTH = 50;

const scoutingScheduleBlockSizeSchema = z
  .number()
  .int()
  .refine(
    (value): value is ScoutingScheduleBlockSize =>
      SCOUTING_SCHEDULE_BLOCK_SIZE_OPTIONS.includes(
        value as ScoutingScheduleBlockSize
      ),
    {
      message: "Choose a valid match group size.",
    }
  );

function normalizeScouterNamesForValidation(names: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const name of names) {
    const trimmed = name.trim();
    const normalizedKey = trimmed.toLocaleLowerCase();

    if (!trimmed || seen.has(normalizedKey)) {
      continue;
    }

    seen.add(normalizedKey);
    normalized.push(trimmed);
  }

  return normalized;
}

export function getMinimumScoutersForMode(mode: ScoutingScheduleMode): number {
  return mode === "robot" ? 6 : 2;
}

export function getMinimumScoutersMessage(mode: ScoutingScheduleMode): string {
  return mode === "robot"
    ? "Robot schedules require at least 6 scouters."
    : "Alliance schedules require at least 2 scouters.";
}

export const scoutingScheduleConfigSchema = z
  .object({
    mode: z.enum(["robot", "alliance"]),
    blockSize: scoutingScheduleBlockSizeSchema.default(
      getScoutingScheduleBlockSize(undefined)
    ),
    scouterNames: z.array(
      z
        .string()
        .trim()
        .min(
          MIN_SCOUTER_NAME_LENGTH,
          `Scouter names must be at least ${MIN_SCOUTER_NAME_LENGTH} character.`
        )
        .max(
          MAX_SCOUTER_NAME_LENGTH,
          `Scouter names must be ${MAX_SCOUTER_NAME_LENGTH} characters or fewer.`
        )
    ),
    matchNumbers: z.array(z.number().int().positive()),
  })
  .superRefine((data, ctx) => {
    const normalizedScouterNames = normalizeScouterNamesForValidation(
      data.scouterNames
    );
    const minimumScouters = getMinimumScoutersForMode(data.mode);

    if (normalizedScouterNames.length < minimumScouters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scouterNames"],
        message: getMinimumScoutersMessage(data.mode),
      });
    }

    if (data.matchNumbers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matchNumbers"],
        message: "No qualification matches are available for this event yet.",
      });
    }
  });

export type ScoutingScheduleConfigInput = z.infer<
  typeof scoutingScheduleConfigSchema
>;

export function validateScoutingScheduleConfig(
  input: ScoutingScheduleConfigInput
): ScoutingScheduleConfigInput {
  return scoutingScheduleConfigSchema.parse(input);
}

const scoutingScheduleEntrySchema = z.object({
  matchNumber: z.number().int().positive(),
  assignments: z.record(z.string(), z.string().nullable().optional()),
  hasCollectedData: z.boolean().nullable().optional(),
});

export const scoutingScheduleDocumentSchema = z
  .object({
    mode: z.enum(["robot", "alliance"]),
    blockSize: scoutingScheduleBlockSizeSchema.default(
      getScoutingScheduleBlockSize(undefined)
    ),
    scouterNames: z.array(
      z
        .string()
        .trim()
        .min(
          MIN_SCOUTER_NAME_LENGTH,
          `Scouter names must be at least ${MIN_SCOUTER_NAME_LENGTH} character.`
        )
        .max(
          MAX_SCOUTER_NAME_LENGTH,
          `Scouter names must be ${MAX_SCOUTER_NAME_LENGTH} characters or fewer.`
        )
    ),
    matches: z.array(scoutingScheduleEntrySchema),
  })
  .superRefine((data, ctx) => {
    const normalizedScouterNames = normalizeScouterNamesForValidation(
      data.scouterNames
    );
    const minimumScouters = getMinimumScoutersForMode(data.mode);

    if (normalizedScouterNames.length < minimumScouters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scouterNames"],
        message: getMinimumScoutersMessage(data.mode),
      });
    }

    data.matches.forEach((entry, index) => {
      const normalizedAssignments = Object.values(entry.assignments)
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));

      const seen = new Set<string>();

      for (const name of normalizedAssignments) {
        const normalizedName = name.toLocaleLowerCase();

        if (seen.has(normalizedName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["matches", index, "assignments"],
            message: `Match ${entry.matchNumber} assigns the same scout to multiple positions.`,
          });
          break;
        }

        seen.add(normalizedName);
      }
    });
  });

export type ScoutingScheduleDocumentInput = {
  mode: ScoutingScheduleMode;
  blockSize: ScoutingScheduleBlockSize;
  scouterNames: string[];
  matches: ScoutingScheduleEntry[];
};

export function validateScoutingScheduleDocument(
  input: ScoutingScheduleDocumentInput
): ScoutingScheduleDocumentInput {
  return scoutingScheduleDocumentSchema.parse(
    input
  ) as ScoutingScheduleDocumentInput;
}
