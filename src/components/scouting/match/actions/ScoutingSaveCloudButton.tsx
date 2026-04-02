import { MatchScoutingPayload } from "@/components/match-scouting/types";
import { Button } from "@mui/material";
import { useToast } from "@/lib/hooks/useToast";
import { saveMatchScoutingEntry } from "@/lib/firebase/client/entries";

type Props = {
  payload: MatchScoutingPayload;
  onReset?: () => void;
};

export default function ScoutingSaveCloudButton({ payload, onReset }: Props) {
  const toast = useToast();

  const handleSaveCloud = async () => {
    if (!payload.selectedTeamKey || payload.teamNumber == null) {
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

      toast.success("Saved to cloud.");
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
