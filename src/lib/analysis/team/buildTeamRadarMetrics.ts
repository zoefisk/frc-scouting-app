import { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";

export type TeamRadarMetric = {
  label: string;
  value: number;
};

export type TeamRadarSummary = {
  metrics: TeamRadarMetric[];
  sampleSize: number;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageNullable(values: Array<number | null | undefined>): number {
  const filtered = values.filter((v): v is number => typeof v === "number");
  return average(filtered);
}

export function buildTeamRadarSummary(
  entries: MatchScoutingEntryDoc[]
): TeamRadarSummary {
  const presentEntries = entries.filter(
    (entry) => entry.teamPresence === "present"
  );

  const scoringEffectiveness = averageNullable(
    presentEntries.map((entry) => entry.teleop?.scoringEffectiveness)
  );

  const scoringAccuracy = averageNullable(
    presentEntries.map((entry) => {
      const raw = entry.teleop?.scoringAccuracy;
      return typeof raw === "number" ? raw / 20 : null;
    })
  );

  const cycleSpeed = averageNullable(
    presentEntries.map((entry) => entry.teleop?.cycleSpeed)
  );

  const driverControl = averageNullable(
    presentEntries.map((entry) => entry.teleop?.driverControl)
  );

  const defenseAbility = averageNullable(
    presentEntries.map((entry) =>
      entry.teleop?.playedDefense
        ? (entry.teleop?.defenseAbility ?? null)
        : null
    )
  );

  const defenseResistance = averageNullable(
    presentEntries.map((entry) =>
      entry.teleop?.wasDefended
        ? (entry.teleop?.defenseResistance ?? null)
        : null
    )
  );

  const overallPerformance = averageNullable(
    presentEntries.map((entry) => entry.finalComments?.overallPerformance)
  );

  return {
    sampleSize: presentEntries.length,
    metrics: [
      { label: "Scoring", value: scoringEffectiveness },
      { label: "Accuracy", value: scoringAccuracy },
      { label: "Cycle Speed", value: cycleSpeed },
      { label: "Driver Control", value: driverControl },
      { label: "Defense", value: defenseAbility },
      { label: "Defense Resist", value: defenseResistance },
      { label: "Overall", value: overallPerformance },
    ],
  };
}
