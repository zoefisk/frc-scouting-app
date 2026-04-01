export type ScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3"
  | "";

export type TeamData = {
  key: string;
  team_number: number;
  nickname: string;
  name?: string;
};

export type TbaMatch = {
  key: string;
  comp_level: string;
  set_number: number;
  match_number: number;
  alliances: {
    blue: {
      team_keys: string[];
    };
    red: {
      team_keys: string[];
    };
  };
};
