"use client";

import React from "react";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import TeamRadarChart, { TeamRadarSeries } from "@/components/analysis/team/TeamRadarChart";

type Props = {
    sampleSize: number;
    series: TeamRadarSeries[];
    picker?: React.ReactNode;
    loading?: boolean;
    error?: string;
};

export default function TeamRadarCard({
                                          sampleSize,
                                          series,
                                          picker,
                                          loading = false,
                                          error = "",
                                      }: Props) {
    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Team Radar
                </Typography>

                <Typography color="text.secondary">
                    Based on {sampleSize} present scouted match
                    {sampleSize === 1 ? "" : "es"}.
                </Typography>

                {picker}

                {loading && (
                    <Typography color="text.secondary">
                        Loading comparison team...
                    </Typography>
                )}

                {error && <Alert severity="warning">{error}</Alert>}

                <TeamRadarChart series={series} />
            </Stack>
        </Paper>
    );
}
