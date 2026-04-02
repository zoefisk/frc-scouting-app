import { MatchScoutingEntryDoc } from "@/old-lib/firebase/shared/types";

export type TeamCommentRow = {
  matchNumber: number;
  overallPerformance: number | null;
  didWell: string;
  canImprove: string;
  generalComments: string;
  savedAt: string;
};

export function buildTeamCommentsSummary(
  entries: MatchScoutingEntryDoc[]
): TeamCommentRow[] {
  return entries
    .map((entry) => ({
      matchNumber: entry.matchNumber,
      overallPerformance:
        typeof entry.finalComments?.overallPerformance === "number"
          ? entry.finalComments.overallPerformance
          : null,
      didWell: entry.finalComments?.didWell?.trim() ?? "",
      canImprove: entry.finalComments?.canImprove?.trim() ?? "",
      generalComments: entry.finalComments?.generalComments?.trim() ?? "",
      savedAt: entry.savedAt ?? "",
    }))
    .filter(
      (row) =>
        row.didWell ||
        row.canImprove ||
        row.generalComments ||
        row.overallPerformance != null
    )
    .sort((a, b) => a.matchNumber - b.matchNumber);
}
