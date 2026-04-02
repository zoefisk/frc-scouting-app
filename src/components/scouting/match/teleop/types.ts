export type TeleopRating = number;

export type TeleopClimb = "not_attempted" | "failed" | "l1" | "l2" | "l3";

export type TeleopData = {
  scoringEffectiveness: number;
  scoringAccuracy: number;
  cycleSpeed: number;
  driverControl: number;

  playedDefense: boolean | null;
  defenseAbility: number | null;

  wasDefended: boolean | null;
  defenseResistance: number | null;

  climb: TeleopClimb | null;

  notes: string;
};
