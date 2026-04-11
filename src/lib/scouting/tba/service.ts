import { fetchTbaJson } from "./api";
import type {
  EventQualificationMatch,
  EventTeamWithRank,
  RawTbaEvent,
  RawTbaMatch,
  RawTbaRankingsResponse,
  RawTbaRankingRow,
  RawTbaTeam,
  SimpleEventOption,
  TeamEventMatchRow,
  TeamEventSummary,
} from "./types";

function teamKeyToNumber(teamKey: string): number {
  return Number(teamKey.replace("frc", ""));
}

export function teamNumberToKey(teamNumber: number | string): string {
  return `frc${teamNumber}`;
}

export async function getTeam(
  teamNumber: number | string
): Promise<RawTbaTeam> {
  return fetchTbaJson<RawTbaTeam>(`/team/${teamNumberToKey(teamNumber)}`);
}

export async function getEvent(eventKey: string): Promise<RawTbaEvent> {
  return fetchTbaJson<RawTbaEvent>(`/event/${eventKey}`);
}

export async function getEvents(
  year: number | string
): Promise<SimpleEventOption[]> {
  const data = await fetchTbaJson<RawTbaEvent[]>(`/events/${year}`);

  return (data ?? []).map((event) => ({
    key: event.key,
    name: event.name,
    week:
      typeof event.week === "number" && Number.isFinite(event.week)
        ? event.week
        : null,
  }));
}

export async function getEventTeams(eventKey: string): Promise<RawTbaTeam[]> {
  return fetchTbaJson<RawTbaTeam[]>(`/event/${eventKey}/teams`);
}

export async function getEventTeamsSimple(
  eventKey: string
): Promise<RawTbaTeam[]> {
  return fetchTbaJson<RawTbaTeam[]>(`/event/${eventKey}/teams/simple`);
}

export async function getEventRankings(
  eventKey: string
): Promise<RawTbaRankingsResponse> {
  return fetchTbaJson<RawTbaRankingsResponse>(`/event/${eventKey}/rankings`);
}

export async function getEventMatches(
  eventKey: string
): Promise<RawTbaMatch[]> {
  return fetchTbaJson<RawTbaMatch[]>(`/event/${eventKey}/matches`);
}

export async function getEventQualificationMatches(
  eventKey: string
): Promise<EventQualificationMatch[]> {
  const matches = await getEventMatches(eventKey);

  return matches
    .filter((match) => match.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number)
    .map((match) => ({
      matchKey: match.key,
      matchNumber: match.match_number,
      blueTeams: match.alliances.blue.team_keys.map(teamKeyToNumber),
      redTeams: match.alliances.red.team_keys.map(teamKeyToNumber),
    }));
}

export async function getEventTeamsWithRanks(
  eventKey: string
): Promise<EventTeamWithRank[]> {
  const [teamsData, rankingsData] = await Promise.all([
    getEventTeamsSimple(eventKey),
    getEventRankings(eventKey),
  ]);

  const teams: RawTbaTeam[] = Array.isArray(teamsData) ? teamsData : [];
  const rankings: RawTbaRankingRow[] = Array.isArray(rankingsData.rankings)
    ? rankingsData.rankings
    : [];

  const rankMap = new Map<string, number>();

  for (const row of rankings) {
    if (typeof row.team_key === "string" && typeof row.rank === "number") {
      rankMap.set(row.team_key, row.rank);
    }
  }

  return [...teams]
    .map((team) => ({
      key: team.key,
      teamNumber: team.team_number,
      nickname: team.nickname ?? "",
      rank: rankMap.get(team.key) ?? null,
    }))
    .sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      if (a.rank != null) return -1;
      if (b.rank != null) return 1;
      return a.teamNumber - b.teamNumber;
    });
}

export async function getTeamEventMatches(
  eventKey: string,
  teamKey: string
): Promise<TeamEventMatchRow[]> {
  const matches = await fetchTbaJson<RawTbaMatch[]>(
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

export async function getTeamEventSummary(
  eventKey: string,
  teamKey: string
): Promise<TeamEventSummary> {
  const matches = await getTeamEventMatches(eventKey, teamKey);

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const match of matches) {
    if (match.result === "W") wins += 1;
    else if (match.result === "L") losses += 1;
    else ties += 1;
  }

  return {
    wins,
    losses,
    ties,
    totalMatches: matches.length,
  };
}
