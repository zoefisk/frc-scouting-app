"use client";

import React from "react";
import {
    Alert,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { MatchCoverageWarning } from "@/lib/analysis/buildCoverageWarnings";

type Props = {
    warnings: MatchCoverageWarning[];
};

export default function CoverageWarningsCard({ warnings }: Props) {
    const incomplete = warnings.filter((warning) => !warning.isComplete);

    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Coverage Warnings
                </Typography>

                {incomplete.length === 0 ? (
                    <Alert severity="success">All loaded matches are fully scouted.</Alert>
                ) : (
                    <Stack spacing={1.5}>
                        {incomplete.map((warning) => (
                            <Alert key={warning.matchNumber} severity="warning">
                                <Stack spacing={1}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Match {warning.matchNumber}: {warning.missingTeams.length} missing
                                    </Typography>

                                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                        {warning.missingTeams.map((team) => (
                                            <Chip key={team} label={`#${team}`} size="small" />
                                        ))}
                                    </Stack>
                                </Stack>
                            </Alert>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
