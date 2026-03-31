"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import { Chip, Paper, Stack, Typography } from "@mui/material";

type Props = {
    eventKey: string;
    currentMatch: number | null;
    effectiveOnline: boolean;
    pendingSubmissionCount: number;
    scannedEntryCount: number;
};

function Card({
                  label,
                  value,
              }: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <Paper sx={{ p: 2, height: "100%" }}>
            <Stack spacing={0.75}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <BoxValue>{value}</BoxValue>
            </Stack>
        </Paper>
    );
}

function BoxValue({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {children}
        </Typography>
    );
}

export default function DashboardSummaryCards({
                                                  eventKey,
                                                  currentMatch,
                                                  effectiveOnline,
                                                  pendingSubmissionCount,
                                                  scannedEntryCount,
                                              }: Props) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card label="Current Event" value={eventKey} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card label="Current Match" value={currentMatch ?? "-"} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card
                    label="Sync Status"
                    value={
                        <Chip
                            label={effectiveOnline ? "Online Sync On" : "Forced Offline"}
                            color={effectiveOnline ? "success" : "warning"}
                            size="medium"
                        />
                    }
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card
                    label="Pending Work"
                    value={`${pendingSubmissionCount} local • ${scannedEntryCount} scans`}
                />
            </Grid>
        </Grid>
    );
}
