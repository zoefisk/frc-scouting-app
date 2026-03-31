"use client";

import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TeamCommentRow } from "@/lib/analysis/buildTeamCommentsSummary";

type Props = {
    comments: TeamCommentRow[];
};

export default function TeamScoutCommentsAccordion({ comments }: Props) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>Scout Comments</Typography>
                    <Chip label={comments.length} size="small" />
                </Stack>
            </AccordionSummary>

            <AccordionDetails>
                {comments.length === 0 ? (
                    <Typography color="text.secondary">
                        No scout comments available yet.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {comments.map((comment) => (
                            <Paper key={`${comment.matchNumber}-${comment.savedAt}`} sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Match {comment.matchNumber}
                                    </Typography>

                                    {comment.overallPerformance != null && (
                                        <Typography>
                                            <strong>Overall Rating:</strong> {comment.overallPerformance}
                                        </Typography>
                                    )}

                                    {comment.didWell && (
                                        <Typography>
                                            <strong>Did Well:</strong> {comment.didWell}
                                        </Typography>
                                    )}

                                    {comment.canImprove && (
                                        <Typography>
                                            <strong>Can Improve:</strong> {comment.canImprove}
                                        </Typography>
                                    )}

                                    {comment.generalComments && (
                                        <Typography>
                                            <strong>General Comments:</strong> {comment.generalComments}
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </AccordionDetails>
        </Accordion>
    );
}
