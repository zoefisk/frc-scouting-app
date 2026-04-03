export type MatchScoutingEntryDoc = {
  eventKey: string;
  matchNumber: number;
  teamNumber: number | null;
  teamName?: string;
  teamKey?: string;
  selectedTeamKey?: string | null;

  scoutingPosition?: string;
  robotPosition?: string | null;
  teamPresence?: string | null;

  autonomous?: {
    mobility?: string | null;
    gamePieceOutcome?: string | null;
    climb?: string | null;
    alliancePointShare?: number;
    notes?: string;
  };

  teleop?: {
    scoringEffectiveness?: number;
    scoringAccuracy?: number;
    cycleSpeed?: number;
    driverControl?: number;
    playedDefense?: boolean | null;
    defenseAbility?: number | null;
    wasDefended?: boolean | null;
    defenseResistance?: number | null;
    climb?: string | null;
    notes?: string;
  };

  finalComments?: {
    overallPerformance?: number;
    didWell?: string;
    canImprove?: string;
    generalComments?: string;
  };

  savedAt?: string;
};

export type AppUserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: "scout" | "admin";
  active: boolean;
  joinedProjectIds?: string[];
};
