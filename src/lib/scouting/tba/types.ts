export type TbaAlliance = {
  team_keys: string[];
  score: number;
};

export type RawTbaMatch = {
  key: string;
  comp_level: string;
  match_number: number;
  winning_alliance?: string;
  actual_time?: number | null;
  alliances: {
    blue: TbaAlliance;
    red: TbaAlliance;
  };
  videos?: Array<{
    type: string;
    key: string;
  }>;
};

export type RawTbaTeam = {
  key: string;
  team_number: number;
  nickname?: string;
  name?: string;
};

export type RawTbaRankingRow = {
  team_key: string;
  rank: number;
};

export type RawTbaRankingsResponse = {
  rankings?: RawTbaRankingRow[];
};

export type RawTbaEvent = {
  key: string;
  name: string;
  week?: number | null;
  start_date?: string;
  end_date?: string;
};

export type EventQualificationMatch = {
  matchKey: string;
  matchNumber: number;
  blueTeams: number[];
  redTeams: number[];
};

export type TeamEventMatchRow = {
  matchKey: string;
  matchNumber: number;
  allianceColor: "blue" | "red";
  result: "W" | "L" | "T";
  blueScore: number;
  redScore: number;
  blueTeams: number[];
  redTeams: number[];
  videoUrl: string | null;
};

export type TeamEventSummary = {
  wins: number;
  losses: number;
  ties: number;
  totalMatches: number;
};

export type EventTeamWithRank = {
  key: string;
  teamNumber: number;
  nickname: string;
  rank: number | null;
};

export type SimpleEventOption = {
  key: string;
  name: string;
  week: number | null;
};
