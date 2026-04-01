"use client";

import React from "react";
import {
    Alert,
    Chip,
    Paper,
    Stack,
    Typography,
    Button,
} from "@mui/material";
import {MatchCoverageWarning} from "@/lib/analysis/dashboard/buildCoverageWarnings";

type Props = {
    warnings: MatchCoverageWarning[];
};

const MAX_VISIBLE = 5;

export default function CoverageWarningsCard({ warnings }: Props) {
    const [expanded, setExpanded] = React.useState(false);

    const incomplete = warnings.filter((warning) => !warning.isComplete);

    const visibleWarnings = expanded
        ? incomplete
        : incomplete.slice(0, MAX_VISIBLE);

    const hiddenCount = incomplete.length - visibleWarnings.length;

    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Coverage Warnings
                </Typography>

                {incomplete.length === 0 ? (
                    <Alert severity="success">
                        All loaded matches are fully scouted.
                    </Alert>
                ) : (
                    <Stack spacing={1.5}>
                        {visibleWarnings.map((warning) => (
                            <Alert key={warning.matchNumber} severity="warning">
                                <Stack spacing={1}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Match {warning.matchNumber}:{" "}
                                        {warning.missingTeams.length} missing
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                        useFlexGap
                                        flexWrap="wrap"
                                    >
                                        {warning.missingTeams.map((team) => (
                                            <Chip
                                                key={team}
                                                label={`#${team}`}
                                                size="small"
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </Alert>
                        ))}

                        {hiddenCount > 0 && (
                            <Button
                                size="small"
                                onClick={() => setExpanded((prev) => !prev)}
                                sx={{ alignSelf: "flex-start" }}
                            >
                                {expanded
                                    ? "Show less"
                                    : `Show ${hiddenCount} more`}
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
