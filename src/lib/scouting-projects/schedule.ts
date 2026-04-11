import {
  type ScoutingScheduleDoc,
  type ScoutingScheduleEntry,
  type ScoutingScheduleMode,
  type ScoutingScheduleSlot,
  SCOUTING_SCHEDULE_SLOTS_BY_MODE,
} from "@/lib/scouting-projects/types";
import {
  getMinimumScoutersForMode,
  getMinimumScoutersMessage,
} from "@/lib/scouting-projects/scouting-schedule/validation";
import type { RawTbaMatch } from "@/lib/scouting/tba/types";

export const DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE = 5;

export function normalizeScouterNames(names: string[]): string[] {
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

export function getScheduleSlotsForMode(
  mode: ScoutingScheduleMode
): readonly ScoutingScheduleSlot[] {
  return SCOUTING_SCHEDULE_SLOTS_BY_MODE[mode];
}

export function getQualificationMatches(matches: RawTbaMatch[]): RawTbaMatch[] {
  return [...matches]
    .filter((match) => match.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number);
}

export function isTbaMatchPlayed(match: RawTbaMatch): boolean {
  const hasScores =
    match.alliances.blue.score !== -1 && match.alliances.red.score !== -1;
  const hasWinner =
    typeof match.winning_alliance === "string" &&
    match.winning_alliance.length > 0;
  const hasActualTime =
    typeof match.actual_time === "number" && match.actual_time > 0;

  return hasScores || hasWinner || hasActualTime;
}

export function buildBlankScoutingSchedule(
  mode: ScoutingScheduleMode,
  matchNumbers: number[],
  scouterNames: string[]
): ScoutingScheduleDoc {
  const normalizedNames = normalizeScouterNames(scouterNames);
  const slots = getScheduleSlotsForMode(mode);

  return {
    mode,
    scouterNames: normalizedNames,
    matches: matchNumbers.map((matchNumber) => ({
      matchNumber,
      assignments: Object.fromEntries(slots.map((slot) => [slot, null])),
      hasCollectedData: null,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function generateFairScoutingSchedule(
  mode: ScoutingScheduleMode,
  matchNumbers: number[],
  scouterNames: string[]
): ScoutingScheduleDoc {
  const normalizedNames = normalizeScouterNames(scouterNames);
  const minimumScouters = getMinimumScoutersForMode(mode);
  const slots = getScheduleSlotsForMode(mode);

  if (normalizedNames.length < minimumScouters) {
    throw new Error(getMinimumScoutersMessage(mode));
  }

  const assignmentCounts = new Map<string, number>();
  const lastAssignedAt = new Map<string, number>();
  const originalOrder = new Map<string, number>();

  normalizedNames.forEach((name, index) => {
    assignmentCounts.set(name, 0);
    lastAssignedAt.set(name, -1);
    originalOrder.set(name, index);
  });

  let assignmentStep = 0;
  const matches: ScoutingScheduleEntry[] = [];

  for (
    let blockStart = 0;
    blockStart < matchNumbers.length;
    blockStart += DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE
  ) {
    const blockMatchNumbers = matchNumbers.slice(
      blockStart,
      blockStart + DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE
    );
    const usedInBlock = new Set<string>();
    const blockAssignments: Partial<
      Record<ScoutingScheduleSlot, string | null>
    > = {};

    for (const slot of slots) {
      const primaryPool = normalizedNames.filter(
        (name) => !usedInBlock.has(name)
      );
      const pool = primaryPool.length > 0 ? primaryPool : normalizedNames;

      if (pool.length === 0) {
        blockAssignments[slot] = null;
        continue;
      }

      const [selectedName] = [...pool].sort((a, b) => {
        const countDifference =
          (assignmentCounts.get(a) ?? 0) - (assignmentCounts.get(b) ?? 0);

        if (countDifference !== 0) {
          return countDifference;
        }

        const lastAssignedDifference =
          (lastAssignedAt.get(a) ?? -1) - (lastAssignedAt.get(b) ?? -1);

        if (lastAssignedDifference !== 0) {
          return lastAssignedDifference;
        }

        return (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0);
      });

      blockAssignments[slot] = selectedName;
      usedInBlock.add(selectedName);
      assignmentCounts.set(
        selectedName,
        (assignmentCounts.get(selectedName) ?? 0) + blockMatchNumbers.length
      );
      lastAssignedAt.set(selectedName, assignmentStep);
      assignmentStep += 1;
    }

    for (const matchNumber of blockMatchNumbers) {
      matches.push({
        matchNumber,
        assignments: { ...blockAssignments },
        hasCollectedData: null,
      });
    }
  }

  return {
    mode,
    scouterNames: normalizedNames,
    matches,
    updatedAt: new Date().toISOString(),
  };
}

export function getScoutingDataCollectionStatusForMatch(
  entry: ScoutingScheduleEntry
): boolean | null {
  void entry;
  // TODO: derive this from submitted scouting data once match-scoped collection
  // tracking is connected to scouting project schedules.
  return null;
}
