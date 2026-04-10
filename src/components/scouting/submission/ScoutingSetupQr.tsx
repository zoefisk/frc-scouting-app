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

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: string | null;
  teamPresence: string;
  selectedTeam: TeamOption | null;
};

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: MatchSetupState;
  disabled?: boolean;
};

function truncateLongStrings(value: unknown, maxLength = 120): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}…`;
}

function sanitizeAnswersForQr(
  answers: QuestionnaireAnswers
): QuestionnaireAnswers {
  const entries = Object.entries(answers).map(([key, value]) => [
    key,
    truncateLongStrings(value),
  ]);

  return Object.fromEntries(entries);
}

export default function ScoutingSetupQr({
  questionnaire,
  answers,
  setup,
  disabled = false,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const isIncomplete =
    !setup.eventKey ||
    !setup.matchNumber ||
    !setup.scoutingPosition ||
    !setup.selectedTeam;

  const payload = React.useMemo(() => {
    return {
      v: 1,
      type: "questionnaire_response",

      questionnaire: {
        id: questionnaire.id,
        name: questionnaire.name,
        version: questionnaire.version,
      },

      setup: {
        eventKey: setup.eventKey,
        matchNumber: setup.matchNumber,
        scoutingPosition: setup.scoutingPosition,
        teamPresence: setup.teamPresence,
        teamKey: setup.selectedTeam?.key ?? null,
        teamNumber: setup.selectedTeam?.team_number ?? null,
        teamName:
          setup.selectedTeam?.nickname ??
          setup.selectedTeam?.name ??
          setup.selectedTeam?.key ??
          "",
      },

      answers: sanitizeAnswersForQr(answers),

      savedAt: new Date().toISOString(),
    };
  }, [questionnaire, answers, setup]);

  const qrValue = React.useMemo(() => JSON.stringify(payload), [payload]);

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        disabled={disabled || isIncomplete}
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
              Scan this QR to transfer the current questionnaire response.
            </Typography>

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2">
                <strong>Questionnaire:</strong> {questionnaire.name} v
                {questionnaire.version}
              </Typography>
              <Typography variant="body2">
                <strong>Event:</strong> {setup.eventKey}
              </Typography>
              <Typography variant="body2">
                <strong>Match:</strong> {setup.matchNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Scouting Position:</strong> {setup.scoutingPosition}
              </Typography>
              <Typography variant="body2">
                <strong>Team:</strong>{" "}
                {setup.selectedTeam
                  ? `#${setup.selectedTeam.team_number} ${
                      setup.selectedTeam.nickname ??
                      setup.selectedTeam.name ??
                      setup.selectedTeam.key
                    }`
                  : "None selected"}
              </Typography>
              <Typography variant="body2">
                <strong>Team Presence:</strong> {setup.teamPresence}
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
