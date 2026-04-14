import type { ScoutingScheduleSlot } from "@/lib/scouting-projects/types";
import type { RawTbaMatch } from "@/lib/scouting/tba/types";

export type ProjectMatchCoverageByMatch = Record<
  number,
  {
    hasAnyData: boolean;
    positionsWithData: string[];
  }
>;

export function slotMatchesRecordedPosition(
  slot: ScoutingScheduleSlot,
  recordedPosition: string
): boolean {
  if (slot === recordedPosition) {
    return true;
  }

  if (slot === "redAlliance") {
    return recordedPosition.startsWith("red");
  }

  if (slot === "blueAlliance") {
    return recordedPosition.startsWith("blue");
  }

  return false;
}

export function slotHasRecordedData(
  slot: ScoutingScheduleSlot,
  positionsWithData: string[]
): boolean {
  return positionsWithData.some((position) =>
    slotMatchesRecordedPosition(slot, position)
  );
}

export function countRecordedScheduleSlots(
  slots: ScoutingScheduleSlot[],
  positionsWithData: string[]
): number {
  return slots.filter((slot) => slotHasRecordedData(slot, positionsWithData))
    .length;
}

export function hasNextQualificationMatchStarted(
  matchNumber: number,
  qualificationMatches: RawTbaMatch[],
  nowUnixSeconds = Date.now() / 1000
): boolean {
  const nextMatch = qualificationMatches.find(
    (match) => match.match_number > matchNumber
  );

  if (!nextMatch) {
    return false;
  }

  const startedAt =
    nextMatch.actual_time ?? nextMatch.predicted_time ?? nextMatch.time ?? null;

  return typeof startedAt === "number" && startedAt > 0
    ? startedAt <= nowUnixSeconds
    : false;
}
