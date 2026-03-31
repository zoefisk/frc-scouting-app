"use client";

import React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TeamEventSummary } from "@/lib/tba/getTeamEventSummary";

type Props = {
    rank: number | null;
    eventSummary: TeamEventSummary;
    scoutedMatches: number;
    averageOverallPerformance: number;
};

type StatCardProps = {
    label: string;
    value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
    return (
        <Paper
            sx={{
                p: 2,
                height: "100%",
                minHeight: 110,
                display: "flex",
                alignItems: "center",
            }}
        >
            <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {value}
                </Typography>
            </Stack>
        </Paper>
    );
}

export default function TeamSummaryStats({
                                             rank,
                                             eventSummary,
                                             scoutedMatches,
                                             averageOverallPerformance,
                                         }: Props) {
    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Current Rank" value={rank ?? "-"} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        label="W-L-T"
                        value={`${eventSummary.wins}-${eventSummary.losses}-${eventSummary.ties}`}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Scouted Matches" value={scoutedMatches} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        label="Avg Overall Rating"
                        value={averageOverallPerformance.toFixed(1)}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
