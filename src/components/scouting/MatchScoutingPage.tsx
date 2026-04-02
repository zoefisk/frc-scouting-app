"use client";

import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import QuestionnaireForm from "@/components/scouting/form/QuestionnaireForm";
import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaire/validators";
import { loadEventTeams } from "@/lib/server/client/loadEventTeams";
import MatchScoutingActionBar from "@/components/scouting/submission/MatchScoutingActionBar";

type TeamOption = {
  key: string;
  team_number: number;
  nickname?: string;
  name?: string;
};

type ScoutingPosition = "blue1" | "blue2" | "blue3" | "red1" | "red2" | "red3";

type TeamPresence = "present" | "absent" | "surrogate";

type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamPresence: TeamPresence;
  selectedTeam: TeamOption | null;
};

type BuildSubmissionPayloadArgs<TPayload> = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: MatchSetupState;
};

type Props<TPayload = unknown> = {
  questionnaire: QuestionnaireDefinition;
  defaultEventKey?: string;
  title?: string;
  description?: string;
  buildSubmissionPayload?: (
    args: BuildSubmissionPayloadArgs<TPayload>
  ) => TPayload;
};

const scoutingPositions: Array<{ value: ScoutingPosition; label: string }> = [
  { value: "blue1", label: "Blue 1" },
  { value: "blue2", label: "Blue 2" },
  { value: "blue3", label: "Blue 3" },
  { value: "red1", label: "Red 1" },
  { value: "red2", label: "Red 2" },
  { value: "red3", label: "Red 3" },
];

export default function MatchScoutingPage<TPayload = unknown>({
  questionnaire,
  defaultEventKey = "",
  title = "Match Scouting",
  description = "Configure the match, complete the questionnaire, then save or submit.",
  buildSubmissionPayload,
}: Props<TPayload>) {
  const [eventKey, setEventKey] = React.useState(defaultEventKey);
  const [matchNumber, setMatchNumber] = React.useState("");
  const [scoutingPosition, setScoutingPosition] =
    React.useState<ScoutingPosition | null>(null);
  const [teamPresence, setTeamPresence] =
    React.useState<TeamPresence>("present");

  const [teams, setTeams] = React.useState<TeamOption[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [teamsError, setTeamsError] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState<TeamOption | null>(
    null
  );

  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>({});

  React.useEffect(() => {
    let isCancelled = false;

    async function run() {
      if (!eventKey.trim()) {
        setTeams([]);
        setSelectedTeam(null);
        return;
      }

      try {
        setTeamsLoading(true);
        setTeamsError("");

        const nextTeams = await loadEventTeams(eventKey.trim());

        if (!isCancelled) {
          setTeams(Array.isArray(nextTeams) ? nextTeams : []);
        }
      } catch (error) {
        console.error("Failed to load teams:", error);
        if (!isCancelled) {
          setTeams([]);
          setSelectedTeam(null);
          setTeamsError("Could not load teams for this event.");
        }
      } finally {
        if (!isCancelled) {
          setTeamsLoading(false);
        }
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [eventKey]);

  const setup = React.useMemo<MatchSetupState>(
    () => ({
      eventKey: eventKey.trim(),
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
    }),
    [eventKey, matchNumber, scoutingPosition, teamPresence, selectedTeam]
  );

  const setupIsComplete =
    setup.eventKey !== "" &&
    setup.matchNumber.trim() !== "" &&
    setup.scoutingPosition != null &&
    setup.selectedTeam != null;

  const questionnaireErrors = React.useMemo(
    () => validateQuestionnaireAnswers(questionnaire, answers),
    [questionnaire, answers]
  );

  const questionnaireIsComplete = Object.keys(questionnaireErrors).length === 0;

  const canSubmit = setupIsComplete && questionnaireIsComplete;

  const payload = React.useMemo(() => {
    if (!buildSubmissionPayload) {
      return null;
    }

    return buildSubmissionPayload({
      questionnaire,
      answers,
      setup,
    });
  }, [buildSubmissionPayload, questionnaire, answers, setup]);

  function handleReset() {
    setEventKey(defaultEventKey);
    setMatchNumber("");
    setScoutingPosition(null);
    setTeamPresence("present");
    setSelectedTeam(null);
    setAnswers({});
    setTeamsError("");
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Match Setup
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Event Key"
                value={eventKey}
                onChange={(event) => setEventKey(event.target.value)}
                size="small"
              />

              <TextField
                fullWidth
                label="Match Number"
                value={matchNumber}
                onChange={(event) => setMatchNumber(event.target.value)}
                size="small"
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Scouting Position"
                value={scoutingPosition ?? ""}
                onChange={(event) =>
                  setScoutingPosition(
                    (event.target.value || null) as ScoutingPosition | null
                  )
                }
                size="small"
              >
                <MenuItem value="">
                  <em>None selected</em>
                </MenuItem>

                {scoutingPositions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Team Presence"
                value={teamPresence}
                onChange={(event) =>
                  setTeamPresence(event.target.value as TeamPresence)
                }
                size="small"
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="surrogate">Surrogate</MenuItem>
              </TextField>
            </Stack>

            <Autocomplete<TeamOption>
              options={teams}
              loading={teamsLoading}
              value={selectedTeam}
              onChange={(_, nextTeam) => setSelectedTeam(nextTeam)}
              getOptionLabel={(option) =>
                `${option.team_number} - ${
                  option.nickname ?? option.name ?? option.key
                }`
              }
              isOptionEqualToValue={(option, value) => option.key === value.key}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Team"
                  size="small"
                  error={Boolean(teamsError)}
                  helperText={teamsError}
                />
              )}
            />

            {!setupIsComplete && (
              <Alert severity="info">
                Complete the setup fields above before saving or submitting.
              </Alert>
            )}

            {setupIsComplete && !questionnaireIsComplete && (
              <Alert severity="info">
                Complete all required questionnaire fields before saving or
                submitting.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      <QuestionnaireForm
        definition={questionnaire}
        initialAnswers={answers}
        onAnswersChange={setAnswers}
        onSubmit={async () => {
          // Intentionally no-op here.
          // Saving/submission should be handled by renderActions or a parent callback.
        }}
        showSubmitButton={false}
      />

      <MatchScoutingActionBar
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={!setupIsComplete}
        effectiveOnline={true}
        onReset={handleReset}
      />
    </Stack>
  );
}

export type { MatchSetupState, TeamOption, ScoutingPosition, TeamPresence };
