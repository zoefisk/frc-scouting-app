"use client";

import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import QRCode from "react-qr-code";

import { RobotPosition } from "../setup/RobotPositionField";
import { TeamPresence } from "../setup/TeamPresenceField";
import { ScoutingPosition } from "@/old-lib/scouting/types";
import { AutonomousData } from "@/components/match-scouting/autonomous/types";
import { TeleopData } from "@/components/match-scouting/teleop/types";
import { FinalCommentsData } from "@/components/match-scouting/final/types";

type Props = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamKey: string | null;
  teamNumber: number | null;
  teamName: string;
  robotPosition: RobotPosition;
  teamPresence: TeamPresence;
  autoData: AutonomousData;
  teleopData: TeleopData;
  finalCommentsData: FinalCommentsData;
};

function truncateText(value: string, maxLength = 120) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export default function ScoutingSetupQr({
  eventKey,
  matchNumber,
  scoutingPosition,
  teamKey,
  teamNumber,
  teamName,
  robotPosition,
  teamPresence,
  autoData,
  teleopData,
  finalCommentsData,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const payload = React.useMemo(() => {
    return {
      v: 2,
      type: "full_scouting_entry",

      setup: {
        eventKey,
        matchNumber,
        scoutingPosition,
        teamKey,
        teamNumber,
        teamName,
        robotPosition,
        teamPresence,
      },

      autonomous:
        teamPresence === "present"
          ? {
              mobility: autoData.mobility,
              gamePieceOutcome: autoData.gamePieceOutcome,
              climb: autoData.climb,
              alliancePointShare: autoData.alliancePointShare,
              notes: truncateText(autoData.notes),
            }
          : null,

      teleop:
        teamPresence === "present"
          ? {
              scoringEffectiveness: teleopData.scoringEffectiveness,
              scoringAccuracy: teleopData.scoringAccuracy,
              cycleSpeed: teleopData.cycleSpeed,
              driverControl: teleopData.driverControl,
              playedDefense: teleopData.playedDefense,
              defenseAbility: teleopData.defenseAbility,
              wasDefended: teleopData.wasDefended,
              defenseResistance: teleopData.defenseResistance,
              climb: teleopData.climb,
              notes: truncateText(teleopData.notes),
            }
          : null,

      finalComments: {
        overallPerformance: finalCommentsData.overallPerformance,
        didWell: truncateText(finalCommentsData.didWell),
        canImprove: truncateText(finalCommentsData.canImprove),
        generalComments: truncateText(finalCommentsData.generalComments),
      },

      savedAt: new Date().toISOString(),
    };
  }, [
    eventKey,
    matchNumber,
    scoutingPosition,
    teamKey,
    teamNumber,
    teamName,
    robotPosition,
    teamPresence,
    autoData,
    teleopData,
    finalCommentsData,
  ]);

  const qrValue = React.useMemo(() => JSON.stringify(payload), [payload]);

  const isIncomplete =
    !matchNumber ||
    !scoutingPosition ||
    !teamKey ||
    !robotPosition ||
    !teamPresence;

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        disabled={isIncomplete}
      >
        Generate QR Code
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scouting Entry QR</DialogTitle>

        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                backgroundColor: "white",
                p: 2,
                borderRadius: 2,
              }}
            >
              <QRCode value={qrValue} size={260} />
            </Box>

            <Typography variant="body2" color="text.secondary" align="center">
              Scan this QR to transfer the current scouting entry.
            </Typography>

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2">
                <strong>Match:</strong> {matchNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Scouting Position:</strong> {scoutingPosition}
              </Typography>
              <Typography variant="body2">
                <strong>Team:</strong>{" "}
                {teamNumber ? `#${teamNumber} ${teamName}` : teamKey}
              </Typography>
              <Typography variant="body2">
                <strong>Robot Position:</strong> {robotPosition}
              </Typography>
              <Typography variant="body2">
                <strong>Team Presence:</strong> {teamPresence}
              </Typography>
              <Typography variant="body2">
                <strong>QR Size:</strong> {qrValue.length} characters
              </Typography>
            </Box>

            <Button variant="outlined" onClick={() => setOpen(false)}>
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
