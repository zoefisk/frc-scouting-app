import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

export type ScoutingSessionKind = "match" | "pit";
export type MatchCollectionMode = "robot" | "alliance";
export type MatchTeamPresence = "present" | "absent" | "surrogate";
export type MatchRobotPosition = "left" | "center" | "right" | null;
export type MatchScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3"
  | "blueAlliance"
  | "redAlliance";

export type AllianceTeamSetup = {
  slot: 1 | 2 | 3;
  team: TeamOption | null;
  teamPresence: MatchTeamPresence;
  robotPosition: MatchRobotPosition;
};

export type ScoutingSetupState = {
  kind: ScoutingSessionKind;
  projectId?: string;
  eventKey: string;
  matchCollectionMode?: MatchCollectionMode;
  matchNumber?: string;
  scoutingPosition?: MatchScoutingPosition | null;
  teamPresence?: MatchTeamPresence;
  selectedTeam: TeamOption | null;
  allianceTeams?: AllianceTeamSetup[];
};

export function isScoutingSetupComplete(setup: ScoutingSetupState): boolean {
  if (!setup.eventKey) {
    return false;
  }

  if (setup.kind === "pit") {
    return setup.selectedTeam != null;
  }

  if (!setup.matchNumber || !setup.scoutingPosition) {
    return false;
  }

  if (setup.matchCollectionMode === "alliance") {
    return (
      (setup.allianceTeams ?? []).length === 3 &&
      (setup.allianceTeams ?? []).every(
        (team) => team.team != null && team.robotPosition != null
      )
    );
  }

  return setup.selectedTeam != null;
}
