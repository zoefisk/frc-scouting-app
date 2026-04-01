import React from "react";
import { Stack } from "@mui/material";
import ScoutingSaveLocalButton from "./ScoutingSaveLocalButton";
import ScoutingSaveCloudButton from "./ScoutingSaveCloudButton";
import ScoutingDownloadCsvButton from "./ScoutingDownloadCsvButton";
import ScoutingSetupQr from "@/components/match-scouting/actions/ScoutingSetupQr";
import { MatchScoutingPayload } from "@/components/match-scouting/types";
import ScoutingResetButton from "@/components/match-scouting/actions/ScoutingResetButton";

type Props = {
  effectiveOnline: boolean;
  payload: MatchScoutingPayload;
  onReset?: () => void;
};

export default function ScoutingActionBar({
  effectiveOnline,
  payload,
  onReset,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
      <ScoutingSaveLocalButton payload={payload} onReset={onReset} />

      {effectiveOnline && (
        <ScoutingSaveCloudButton payload={payload} onReset={onReset} />
      )}

      <ScoutingDownloadCsvButton payload={payload} />

      <ScoutingSetupQr
        eventKey={payload.eventKey}
        matchNumber={payload.matchNumber}
        scoutingPosition={payload.scoutingPosition}
        teamKey={payload.selectedTeamKey}
        teamNumber={payload.teamNumber}
        teamName={payload.teamName}
        robotPosition={payload.robotPosition}
        teamPresence={payload.teamPresence}
        autoData={payload.autoData}
        teleopData={payload.teleopData}
        finalCommentsData={payload.finalCommentsData}
      />

      {onReset && <ScoutingResetButton onReset={onReset} />}
    </Stack>
  );
}
