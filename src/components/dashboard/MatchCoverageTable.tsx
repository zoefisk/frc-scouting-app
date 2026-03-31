"use client";

import React from "react";
import {
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { MatchCoverageWarning } from "@/lib/analysis/buildCoverageWarnings";

type Props = {
    warnings: MatchCoverageWarning[];
};

export default function MatchCoverageTable({ warnings }: Props) {
    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Match Coverage
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Match</strong></TableCell>
                                <TableCell><strong>Expected</strong></TableCell>
                                <TableCell><strong>Scouted</strong></TableCell>
                                <TableCell><strong>Missing</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {warnings.map((warning) => (
                                <TableRow key={warning.matchNumber} hover>
                                    <TableCell>QM {warning.matchNumber}</TableCell>
                                    <TableCell>{warning.expectedTeams.length}</TableCell>
                                    <TableCell>{warning.scoutedTeams.length}</TableCell>
                                    <TableCell>
                                        {warning.missingTeams.length === 0
                                            ? "-"
                                            : warning.missingTeams.map((team) => `#${team}`).join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={warning.isComplete ? "Complete" : "Incomplete"}
                                            color={warning.isComplete ? "success" : "warning"}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Paper>
    );
}
