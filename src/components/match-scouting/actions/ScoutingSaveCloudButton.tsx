import React from "react";
import { Button } from "@mui/material";
import { deleteInProgressSubmission } from "@/old-lib/db";
import { saveMatchScoutingEntry } from "@/old-lib/firebase/client/entries";
import { MatchScoutingPayload } from "@/components/match-scouting/types";
import { useToast } from "@/old-lib/hooks/useToast";

type Props = {
  payload: MatchScoutingPayload;
  draftId?: string;
  onReset?: () => void;
  onSuccess?: () => void;
};

export default function ScoutingSaveCloudButton({
  payload,
  draftId,
  onReset,
  onSuccess,
}: Props) {
  const toast = useToast();

  const handleSaveCloud = async () => {
    if (!payload.teamNumber) {
      toast.warning("No team selected.");
      return;
    }

    try {
      const entryId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${payload.selectedTeamKey}`;

      await saveMatchScoutingEntry({
        eventKey: payload.eventKey,
        matchNumber: Number(payload.matchNumber),
        entryId,
        payload: {
          eventKey: payload.eventKey,
          matchNumber: Number(payload.matchNumber),
          teamKey: payload.selectedTeamKey,
          teamNumber: payload.teamNumber,
          teamName: payload.teamName,
          scoutingPosition: payload.scoutingPosition,
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

      toast.success("Saved to cloud.");
      onSuccess?.();
      onReset?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save to cloud.");
    }
  };

  return (
    <Button variant="outlined" onClick={handleSaveCloud}>
      Save to Cloud
    </Button>
  );
}
