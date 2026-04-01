import { ScoutingPosition } from "@/lib/scouting/types";

export const DEFAULT_EVENT_KEY = "2026cthar";

export const scoutingOptions: {
  value: Exclude<ScoutingPosition, "">;
  alliance: "Blue" | "Red";
  position: 1 | 2 | 3;
  color: string;
}[] = [
  { value: "blue1", alliance: "Blue", position: 1, color: "royalblue" },
  { value: "blue2", alliance: "Blue", position: 2, color: "royalblue" },
  { value: "blue3", alliance: "Blue", position: 3, color: "royalblue" },
  { value: "red1", alliance: "Red", position: 1, color: "crimson" },
  { value: "red2", alliance: "Red", position: 2, color: "crimson" },
  { value: "red3", alliance: "Red", position: 3, color: "crimson" },
];
