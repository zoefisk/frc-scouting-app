import React from "react";
import { Button } from "@mui/material";
import { deleteInProgressSubmission, saveSubmission } from "@/lib/db";
import { MatchScoutingPayload } from "@/components/match-scouting/types";
import { useToast } from "@/lib/hooks/useToast";

type Props = {
  payload: MatchScoutingPayload;
  draftId?: string;
  onReset?: () => void;
  onSuccess?: () => void;
};

export default function ScoutingSaveLocalButton({
  payload,
  draftId,
  onReset,
  onSuccess,
}: Props) {
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

      if (draftId) {
        await deleteInProgressSubmission(draftId);
      }

      toast.success("Saved locally.");
      onSuccess?.();
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
