import { fetchTbaJson } from "@/old-lib/tba/server/fetchTbaJson";

type TbaAlliance = {
  team_keys: string[];
  score: number;
};

type TbaMatch = {
  key: string;
  comp_level: string;
  match_number: number;
  alliances: {
    blue: TbaAlliance;
    red: TbaAlliance;
  };
  videos?: Array<{
    type: string;
    key: string;
  }>;
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

function teamKeyToNumber(teamKey: string): number {
  return Number(teamKey.replace("frc", ""));
}

export async function getTeamEventMatches(
  eventKey: string,
  teamKey: string
): Promise<TeamEventMatchRow[]> {
  const matches = await fetchTbaJson<TbaMatch[]>(
    `/team/${teamKey}/event/${eventKey}/matches`
  );

  return matches
    .filter((match) => match.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number)
    .map((match) => {
      const isBlue = match.alliances.blue.team_keys.includes(teamKey);
      const allianceColor = isBlue ? "blue" : "red";

      const blueScore = match.alliances.blue.score;
      const redScore = match.alliances.red.score;

      let result: "W" | "L" | "T" = "T";
      if (blueScore !== redScore) {
        const blueWon = blueScore > redScore;
        result = (isBlue && blueWon) || (!isBlue && !blueWon) ? "W" : "L";
      }

      const youtubeVideo = match.videos?.find(
        (video) => video.type === "youtube"
      );

      return {
        matchKey: match.key,
        matchNumber: match.match_number,
        allianceColor,
        result,
        blueScore,
        redScore,
        blueTeams: match.alliances.blue.team_keys.map(teamKeyToNumber),
        redTeams: match.alliances.red.team_keys.map(teamKeyToNumber),
        videoUrl: youtubeVideo
          ? `https://www.youtube.com/watch?v=${youtubeVideo.key}`
          : null,
      };
    });
}
