import {
  saveEventMatches,
  saveEventRankings,
  saveEventTeams,
  saveOfflineEvent,
} from "../db";

type RankingsResponse = {
  rankings?: Array<{
    rank: number;
    team_key: string;
  }>;
};

export async function downloadEventBundle(
  eventKey: string,
  eventName: string,
  year: number
) {
  const [teamsRes, matchesRes, rankingsRes] = await Promise.all([
    fetch(`/api/tba/event-teams/${eventKey}`),
    fetch(`/api/tba/event-matches/${eventKey}`),
    fetch(`/api/tba/event-rankings/${eventKey}`),
  ]);

  if (!teamsRes.ok) {
    throw new Error("Could not load event teams.");
  }

  if (!matchesRes.ok) {
    throw new Error("Could not load event matches.");
  }

  if (!rankingsRes.ok) {
    throw new Error("Could not load event rankings.");
  }

  const [teams, matches, rankings] = await Promise.all([
    teamsRes.json(),
    matchesRes.json(),
    rankingsRes.json() as Promise<RankingsResponse>,
  ]);

  await Promise.all([
    saveEventTeams(eventKey, teams),
    saveEventMatches(eventKey, matches),
    saveEventRankings(eventKey, rankings),
    saveOfflineEvent({
      eventKey,
      eventName,
      year,
      downloadedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    }),
  ]);
}
