import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

export type ScoutingSessionKind = "match" | "pit";

export type ScoutingSetupState = {
  kind: ScoutingSessionKind;
  projectId?: string;
  eventKey: string;
  matchNumber?: string;
  scoutingPosition?: string | null;
  teamPresence?: string;
  selectedTeam: TeamOption | null;
};

export function isScoutingSetupComplete(setup: ScoutingSetupState): boolean {
  if (!setup.eventKey || !setup.selectedTeam) {
    return false;
  }

  if (setup.kind === "pit") {
    return true;
  }

  return Boolean(setup.matchNumber && setup.scoutingPosition);
}
