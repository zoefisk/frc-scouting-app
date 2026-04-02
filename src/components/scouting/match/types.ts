import { ScoutingPosition } from "@/old-lib/scouting/types";
import { RobotPosition } from "@/components/match-scouting/setup/RobotPositionField";
import { TeamPresence } from "@/components/match-scouting/setup/TeamPresenceField";
import { AutonomousData } from "@/components/match-scouting/autonomous/types";
import { TeleopData } from "@/components/match-scouting/teleop/types";
import { FinalCommentsData } from "@/components/match-scouting/final/types";

export type MatchScoutingPayload = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  selectedTeamKey: string | null;
  teamNumber: number | null;
  teamName: string;
  robotPosition: RobotPosition;
  teamPresence: TeamPresence;
  autoData: AutonomousData;
  teleopData: TeleopData;
  finalCommentsData: FinalCommentsData;
};
