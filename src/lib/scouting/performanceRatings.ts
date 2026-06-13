/**
 * Built-in performance rating fields that are always appended to every match scouting
 * form. These feed directly into the team radar chart in project analysis.
 *
 * Field IDs use the `__perf_` prefix to avoid collisions with user-defined
 * questionnaire field IDs.
 */

export const PERF_FIELD_IDS = {
  autonomous: "__perf_autonomous",
  scoring: "__perf_scoring",
  accuracy: "__perf_accuracy",
  cycleSpeed: "__perf_cycle_speed",
  driverControl: "__perf_driver_control",
  defense: "__perf_defense",
  defenseResist: "__perf_defense_resist",
} as const;

export type PerfFieldId = (typeof PERF_FIELD_IDS)[keyof typeof PERF_FIELD_IDS];

export const PERF_FIELDS: Array<{ id: PerfFieldId; label: string }> = [
  { id: PERF_FIELD_IDS.autonomous, label: "Autonomous" },
  { id: PERF_FIELD_IDS.scoring, label: "Scoring" },
  { id: PERF_FIELD_IDS.accuracy, label: "Accuracy" },
  { id: PERF_FIELD_IDS.cycleSpeed, label: "Cycle Speed" },
  { id: PERF_FIELD_IDS.driverControl, label: "Driver Control" },
  { id: PERF_FIELD_IDS.defense, label: "Defense" },
  { id: PERF_FIELD_IDS.defenseResist, label: "Defense Resist" },
];

export function getAlliancePerfFieldId(
  teamKey: string,
  fieldId: PerfFieldId
): string {
  return `${fieldId}__${teamKey}`;
}
