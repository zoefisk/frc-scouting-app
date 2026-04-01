import { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";

export type TeamAutoSummary = {
  mobilityYesCount: number;
  mobilityTotal: number;
  averageAlliancePointShare: number;
  gamePieceOutcomeCounts: Record<string, number>;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildTeamAutoSummary(
  entries: MatchScoutingEntryDoc[]
): TeamAutoSummary {
  const presentEntries = entries.filter(
    (entry) => entry.teamPresence === "present"
  );

  const mobilityTotal = presentEntries.filter(
    (entry) => entry.autonomous?.mobility != null
  ).length;

  const mobilityYesCount = presentEntries.filter(
    (entry) => entry.autonomous?.mobility === "yes"
  ).length;

  const alliancePointShares = presentEntries
    .map((entry) => entry.autonomous?.alliancePointShare)
    .filter((value): value is number => typeof value === "number");

  const gamePieceOutcomeCounts: Record<string, number> = {
    scored: 0,
    failed_collect: 0,
    failed_shoot: 0,
    not_sure: 0,
  };

  for (const entry of presentEntries) {
    const outcome = entry.autonomous?.gamePieceOutcome;
    if (outcome && outcome in gamePieceOutcomeCounts) {
      gamePieceOutcomeCounts[outcome] += 1;
    }
  }

  return {
    mobilityYesCount,
    mobilityTotal,
    averageAlliancePointShare: average(alliancePointShares),
    gamePieceOutcomeCounts,
  };
}
