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
import {
  isScoutingSetupComplete,
  ScoutingSetupState,
} from "@/components/scouting/submission/types";
import { buildGenericQuestionnairePayload } from "@/lib/scouting/match/buildSubmissionPayloads";

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: ScoutingSetupState;
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

  const isIncomplete = !isScoutingSetupComplete(setup);

  const payload = React.useMemo(() => {
    return buildGenericQuestionnairePayload(
      questionnaire,
      sanitizeAnswersForQr(answers),
      setup,
      "qr-preview"
    );
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
              {setup.projectId ? (
                <Typography variant="body2">
                  <strong>Project:</strong> {setup.projectId}
                </Typography>
              ) : null}
              {setup.matchNumber ? (
                <Typography variant="body2">
                  <strong>Match:</strong> {setup.matchNumber}
                </Typography>
              ) : null}
              {setup.scoutingPosition ? (
                <Typography variant="body2">
                  <strong>Scouting Position:</strong> {setup.scoutingPosition}
                </Typography>
              ) : null}
              <Typography variant="body2">
                <strong>
                  {setup.matchCollectionMode === "alliance"
                    ? "Alliance:"
                    : "Team:"}
                </strong>{" "}
                {setup.matchCollectionMode === "alliance"
                  ? (setup.allianceTeams ?? [])
                      .map((entry) =>
                        entry.team
                          ? `#${entry.team.team_number} ${
                              entry.team.nickname ??
                              entry.team.name ??
                              entry.team.key
                            }`
                          : null
                      )
                      .filter(Boolean)
                      .join(", ")
                  : setup.selectedTeam
                    ? `#${setup.selectedTeam.team_number} ${
                        setup.selectedTeam.nickname ??
                        setup.selectedTeam.name ??
                        setup.selectedTeam.key
                      }`
                    : "None selected"}
              </Typography>
              {setup.teamPresence ? (
                <Typography variant="body2">
                  <strong>Team Presence:</strong> {setup.teamPresence}
                </Typography>
              ) : null}
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
