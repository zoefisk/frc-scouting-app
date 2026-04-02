import { NextResponse } from "next/server";
import { getEventTeamsWithRanks } from "@/old-lib/tba/server/teams";
import { getTeamMatchScoutingEntries } from "@/old-lib/firebase/server/entries";
import { buildTeamRadarSummary } from "@/old-lib/analysis/team/buildTeamRadarMetrics";

type RouteProps = {
  params: Promise<{
    eventKey: string;
    teamKey: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { eventKey, teamKey } = await params;

    const teams = await getEventTeamsWithRanks(eventKey);
    const team = teams.find((t) => t.key === teamKey);

    if (!team) {
      return NextResponse.json(
        { error: "Team not found for this event." },
        { status: 404 }
      );
    }

    const entries = await getTeamMatchScoutingEntries(
      eventKey,
      team.teamNumber
    );
    const summary = buildTeamRadarSummary(entries);

    return NextResponse.json({
      team: {
        key: team.key,
        teamNumber: team.teamNumber,
        nickname: team.nickname,
        rank: team.rank,
      },
      summary,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load radar summary." },
      { status: 500 }
    );
  }
}
