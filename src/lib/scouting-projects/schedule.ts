import {
  getScoutingScheduleBlockSize,
  type ScoutingScheduleBlockSize,
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

type AssignmentState = {
  assignmentCounts: Map<string, number>;
  lastAssignedAt: Map<string, number>;
  originalOrder: Map<string, number>;
  assignmentStep: number;
};

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
  scouterNames: string[],
  blockSize: ScoutingScheduleBlockSize = DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE
): ScoutingScheduleDoc {
  const normalizedNames = normalizeScouterNames(scouterNames);
  const slots = getScheduleSlotsForMode(mode);
  const normalizedBlockSize = getScoutingScheduleBlockSize(blockSize);

  return {
    mode,
    blockSize: normalizedBlockSize,
    scouterNames: normalizedNames,
    matches: matchNumbers.map((matchNumber) => ({
      matchNumber,
      assignments: Object.fromEntries(slots.map((slot) => [slot, null])),
      hasCollectedData: null,
    })),
    updatedAt: new Date().toISOString(),
  };
}

function createAssignmentState(scouterNames: string[]): AssignmentState {
  const assignmentCounts = new Map<string, number>();
  const lastAssignedAt = new Map<string, number>();
  const originalOrder = new Map<string, number>();

  scouterNames.forEach((name, index) => {
    assignmentCounts.set(name, 0);
    lastAssignedAt.set(name, -1);
    originalOrder.set(name, index);
  });

  return {
    assignmentCounts,
    lastAssignedAt,
    originalOrder,
    assignmentStep: 0,
  };
}

function seedAssignmentStateFromMatches(
  state: AssignmentState,
  mode: ScoutingScheduleMode,
  matches: ScoutingScheduleEntry[],
  scouterNames: string[]
) {
  const validNames = new Set(scouterNames);
  const slots = getScheduleSlotsForMode(mode);

  for (const match of [...matches].sort(
    (a, b) => a.matchNumber - b.matchNumber
  )) {
    for (const slot of slots) {
      const assignedName = match.assignments[slot];

      if (typeof assignedName !== "string" || !validNames.has(assignedName)) {
        continue;
      }

      state.assignmentCounts.set(
        assignedName,
        (state.assignmentCounts.get(assignedName) ?? 0) + 1
      );
      state.lastAssignedAt.set(assignedName, state.assignmentStep);
      state.assignmentStep += 1;
    }
  }
}

function generateScheduleMatches(
  mode: ScoutingScheduleMode,
  matchNumbers: number[],
  normalizedNames: string[],
  state: AssignmentState,
  blockSize: ScoutingScheduleBlockSize
): ScoutingScheduleEntry[] {
  const slots = getScheduleSlotsForMode(mode);
  const matches: ScoutingScheduleEntry[] = [];
  const normalizedBlockSize = getScoutingScheduleBlockSize(blockSize);

  for (
    let blockStart = 0;
    blockStart < matchNumbers.length;
    blockStart += normalizedBlockSize
  ) {
    const blockMatchNumbers = matchNumbers.slice(
      blockStart,
      blockStart + normalizedBlockSize
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
          (state.assignmentCounts.get(a) ?? 0) -
          (state.assignmentCounts.get(b) ?? 0);

        if (countDifference !== 0) {
          return countDifference;
        }

        const lastAssignedDifference =
          (state.lastAssignedAt.get(a) ?? -1) -
          (state.lastAssignedAt.get(b) ?? -1);

        if (lastAssignedDifference !== 0) {
          return lastAssignedDifference;
        }

        return (
          (state.originalOrder.get(a) ?? 0) - (state.originalOrder.get(b) ?? 0)
        );
      });

      blockAssignments[slot] = selectedName;
      usedInBlock.add(selectedName);
      state.assignmentCounts.set(
        selectedName,
        (state.assignmentCounts.get(selectedName) ?? 0) +
          blockMatchNumbers.length
      );
      state.lastAssignedAt.set(selectedName, state.assignmentStep);
      state.assignmentStep += 1;
    }

    for (const matchNumber of blockMatchNumbers) {
      matches.push({
        matchNumber,
        assignments: { ...blockAssignments },
        hasCollectedData: null,
      });
    }
  }

  return matches;
}

export function generateFairScoutingSchedule(
  mode: ScoutingScheduleMode,
  matchNumbers: number[],
  scouterNames: string[],
  blockSize: ScoutingScheduleBlockSize = DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE
): ScoutingScheduleDoc {
  const normalizedNames = normalizeScouterNames(scouterNames);
  const minimumScouters = getMinimumScoutersForMode(mode);
  const normalizedBlockSize = getScoutingScheduleBlockSize(blockSize);

  if (normalizedNames.length < minimumScouters) {
    throw new Error(getMinimumScoutersMessage(mode));
  }
  const state = createAssignmentState(normalizedNames);
  const matches = generateScheduleMatches(
    mode,
    matchNumbers,
    normalizedNames,
    state,
    normalizedBlockSize
  );

  return {
    mode,
    blockSize: normalizedBlockSize,
    scouterNames: normalizedNames,
    matches,
    updatedAt: new Date().toISOString(),
  };
}

export function regenerateFairScoutingScheduleAfterMatch(
  schedule: ScoutingScheduleDoc,
  keepThroughMatchNumber: number,
  scouterNames: string[],
  blockSize: ScoutingScheduleBlockSize = getScoutingScheduleBlockSize(
    schedule.blockSize
  )
): ScoutingScheduleDoc {
  const normalizedNames = normalizeScouterNames(scouterNames);
  const minimumScouters = getMinimumScoutersForMode(schedule.mode);
  const normalizedBlockSize = getScoutingScheduleBlockSize(blockSize);

  if (normalizedNames.length < minimumScouters) {
    throw new Error(getMinimumScoutersMessage(schedule.mode));
  }

  const lockedMatches = schedule.matches
    .filter((entry) => entry.matchNumber <= keepThroughMatchNumber)
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .map((entry) => ({
      ...entry,
      assignments: { ...entry.assignments },
    }));

  const remainingMatchNumbers = schedule.matches
    .map((entry) => entry.matchNumber)
    .filter((matchNumber) => matchNumber > keepThroughMatchNumber)
    .sort((a, b) => a - b);

  const state = createAssignmentState(normalizedNames);
  seedAssignmentStateFromMatches(
    state,
    schedule.mode,
    lockedMatches,
    normalizedNames
  );

  const regeneratedMatches = generateScheduleMatches(
    schedule.mode,
    remainingMatchNumbers,
    normalizedNames,
    state,
    normalizedBlockSize
  );

  return {
    mode: schedule.mode,
    blockSize: normalizedBlockSize,
    scouterNames: normalizedNames,
    matches: [...lockedMatches, ...regeneratedMatches],
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
