import { getTeamEventMatches } from "@/lib/tba/server/teamEventMatches";

export type TeamEventSummary = {
  wins: number;
  losses: number;
  ties: number;
  totalMatches: number;
};

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
