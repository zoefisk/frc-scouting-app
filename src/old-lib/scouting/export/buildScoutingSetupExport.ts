import { RobotPosition } from "@/components/match-scouting/setup/RobotPositionField";
import { TeamPresence } from "@/components/match-scouting/setup/TeamPresenceField";
import { ScoutingPosition } from "@/old-lib/scouting/types";

type Args = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamKey: string;
  teamNumber: number | null;
  teamName: string;
  robotPosition: RobotPosition;
  teamPresence: TeamPresence;
};

export function buildScoutingSetupExport({
  eventKey,
  matchNumber,
  scoutingPosition,
  teamKey,
  teamNumber,
  teamName,
  robotPosition,
  teamPresence,
}: Args) {
  return {
    v: 1,
    type: "scouting_setup",
    eventKey,
    matchNumber,
    scoutingPosition,
    teamKey,
    teamNumber,
    teamName,
    robotPosition,
    teamPresence,
    savedAt: new Date().toISOString(),
  };
}
