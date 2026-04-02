export function buildScoutingDraftId(params: {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: string | null | undefined;
  selectedTeamKey: string | null | undefined;
}) {
  const { eventKey, matchNumber, scoutingPosition, selectedTeamKey } = params;

  return [
    eventKey || "unknown-event",
    matchNumber || "unknown-match",
    scoutingPosition || "unknown-position",
    selectedTeamKey || "unknown-team",
  ].join("::");
}
