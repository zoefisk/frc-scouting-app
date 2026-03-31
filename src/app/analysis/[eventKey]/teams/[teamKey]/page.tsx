import { notFound } from "next/navigation";
import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import React from "react";

import PageShell from "@/components/layout/PageShell";
import TeamRadarCompareContainer from "@/components/analysis/team/TeamRadarCompareContainer";
import TeamMatchHistoryTable from "@/components/analysis/team/TeamMatchHistoryTable";
import TeamScoutCommentsAccordion from "@/components/analysis/team/TeamScoutCommentsAccordion";
import TeamSummaryStats from "@/components/analysis/team/TeamSummaryStats";

import { getEventTeamsWithRanks } from "@/lib/tba/server";
import { getTeamEventMatches } from "@/lib/tba/getTeamEventMatches";
import { getTeamEventSummary } from "@/lib/tba/getTeamEventSummary";
import { buildTeamRadarSummary } from "@/lib/analysis/buildTeamRadarMetrics";
import { buildTeamCommentsSummary } from "@/lib/analysis/buildTeamCommentsSummary";
import { buildTeamTeleopSummary } from "@/lib/analysis/buildTeamTeleopSummary";
import { buildTeamAutoSummary } from "@/lib/analysis/buildTeamAutoSummary";
import { getTeamMatchScoutingEntries } from "@/lib/firebase/server/getTeamMatchScoutingEntries";

type Props = {
    params: Promise<{
        eventKey: string;
        teamKey: string;
    }>;
};

function averageOverall(
    entries: Awaited<ReturnType<typeof getTeamMatchScoutingEntries>>
) {
    const values = entries
        .map((entry) => entry.finalComments?.overallPerformance)
        .filter((value): value is number => typeof value === "number");

    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function TeamAnalysisPage({ params }: Props) {
    const { eventKey, teamKey } = await params;

    const teams = await getEventTeamsWithRanks(eventKey);
    const team = teams.find((t) => t.key === teamKey);

    if (!team) {
        notFound();
    }

    const [scoutingEntries, eventSummary, matchRows] = await Promise.all([
        getTeamMatchScoutingEntries(eventKey, team.teamNumber),
        getTeamEventSummary(eventKey, team.key),
        getTeamEventMatches(eventKey, team.key),
    ]);

    const radarSummary = buildTeamRadarSummary(scoutingEntries);
    const comments = buildTeamCommentsSummary(scoutingEntries);
    const teleopSummary = buildTeamTeleopSummary(scoutingEntries);
    const autoSummary = buildTeamAutoSummary(scoutingEntries);
    const averageOverallPerformance = averageOverall(scoutingEntries);

    return (
        <PageShell width="xl">
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Team {team.teamNumber}
                    </Typography>
                    <Typography color="text.secondary">
                        {team.nickname || "No nickname available"} · {eventKey}
                    </Typography>
                </Box>

                <Grid marginBottom={10}>
                    <TeamSummaryStats
                        rank={team.rank}
                        eventSummary={eventSummary}
                        scoutedMatches={radarSummary.sampleSize}
                        averageOverallPerformance={averageOverallPerformance}
                    />
                </Grid>

                <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, xl: 5 }}>
                        <TeamRadarCompareContainer
                            eventKey={eventKey}
                            baseTeam={{
                                key: team.key,
                                teamNumber: team.teamNumber,
                                nickname: team.nickname || "",
                            }}
                            baseSummary={radarSummary}
                            teamOptions={teams.map((t) => ({
                                key: t.key,
                                teamNumber: t.teamNumber,
                                nickname: t.nickname || "",
                            }))}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, xl: 7 }}>
                        <TeamMatchHistoryTable
                            matches={matchRows}
                            teamNumber={team.teamNumber}
                        />
                    </Grid>
                </Grid>

                <TeamScoutCommentsAccordion comments={comments} />

                <Box>
                    <Link
                        href={`/analysis/${eventKey}/teams`}
                        style={{ textDecoration: "underline" }}
                    >
                        Back to teams
                    </Link>
                </Box>
            </Stack>
        </PageShell>
    );
}
