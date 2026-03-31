"use client";

import React from "react";
import { Button } from "@mui/material";
import { saveSubmission } from "@/lib/db/indexDb";
import { useToast } from "@/lib/hooks/useToast";
import { MatchScoutingPayload } from "@/components/match-scouting/types";

type Props = {
    payload: MatchScoutingPayload;
    onReset?: () => void;
};

export default function ScoutingSaveLocalButton({ payload, onReset }: Props) {
    const toast = useToast();

    const handleSaveLocal = async () => {
        try {
            const submissionId =
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${payload.selectedTeamKey}`;

            await saveSubmission({
                submissionId,
                eventKey: payload.eventKey,
                matchNumber: payload.matchNumber,
                payload: {
                    eventKey: payload.eventKey,
                    matchNumber: payload.matchNumber,
                    scoutingPosition: payload.scoutingPosition,
                    selectedTeamKey: payload.selectedTeamKey,
                    teamNumber: payload.teamNumber,
                    teamName: payload.teamName,
                    robotPosition: payload.robotPosition,
                    teamPresence: payload.teamPresence,
                    autonomous: payload.autoData,
                    teleop: payload.teleopData,
                    finalComments: payload.finalCommentsData,
                    savedAt: new Date().toISOString(),
                },
            });

            toast.success("Saved locally.");
            onReset?.();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save locally.");
        }
    };

    return (
        <Button variant="contained" onClick={handleSaveLocal}>
            Save to Local
        </Button>
    );
}
