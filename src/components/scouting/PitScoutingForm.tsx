"use client";

import React from "react";
import {
  Alert,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import QuestionnaireForm from "@/components/scouting/form/QuestionnaireForm";
import TeamAutocompleteField from "@/components/scouting/form/fields/match-info/TeamAutocompleteField";
import MatchScoutingActionBar from "@/components/scouting/submission/MatchScoutingActionBar";
import UnsavedChangesGuard from "@/components/app/guards/UnsavedChangesGuard";
import { ScoutingSetupState } from "@/components/scouting/submission/types";
import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaire/validators";
import { loadEventTeamsForScouting } from "@/lib/scouting/match/setupData";
import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

type Props = {
  questionnaire: QuestionnaireDefinition;
  projectId?: string;
  defaultEventKey?: string;
  defaultTeamKey?: string;
  title?: string;
  description?: string;
};

export default function PitScoutingForm({
  questionnaire,
  projectId,
  defaultEventKey = "",
  defaultTeamKey,
  title = "Pit Scouting",
  description = "Choose a team, complete the questionnaire, then save or submit.",
}: Props) {
  const [eventKey, setEventKey] = React.useState(defaultEventKey);
  const [teams, setTeams] = React.useState<TeamOption[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [setupError, setSetupError] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState<TeamOption | null>(
    null
  );
  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>({});

  React.useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      if (!eventKey.trim()) {
        setTeams([]);
        setSelectedTeam(null);
        setSetupError("");
        return;
      }

      try {
        setTeamsLoading(true);
        setSetupError("");
        const result = await loadEventTeamsForScouting(eventKey.trim());

        if (cancelled) {
          return;
        }

        setTeams(result.data);
      } catch (error) {
        console.error("Failed to load pit scouting teams:", error);
        if (!cancelled) {
          setTeams([]);
          setSelectedTeam(null);
          setSetupError("Could not load event teams.");
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false);
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
  }, [eventKey]);

  React.useEffect(() => {
    if (!defaultTeamKey || teams.length === 0) {
      return;
    }

    const suggestedTeam =
      teams.find((team) => team.key === defaultTeamKey) ?? null;

    if (suggestedTeam) {
      setSelectedTeam(suggestedTeam);
    }
  }, [defaultTeamKey, teams]);

  const setup = React.useMemo<ScoutingSetupState>(
    () => ({
      kind: "pit",
      projectId,
      eventKey: eventKey.trim(),
      selectedTeam,
    }),
    [eventKey, projectId, selectedTeam]
  );

  const setupIsComplete = setup.eventKey !== "" && setup.selectedTeam != null;
  const questionnaireErrors = React.useMemo(
    () => validateQuestionnaireAnswers(questionnaire, answers),
    [questionnaire, answers]
  );
  const questionnaireIsComplete = Object.keys(questionnaireErrors).length === 0;
  const canSubmit = setupIsComplete && questionnaireIsComplete;

  const handleReset = React.useCallback(() => {
    setEventKey(defaultEventKey);
    setTeams([]);
    setSelectedTeam(null);
    setAnswers({});
    setSetupError("");
  }, [defaultEventKey]);

  const showUnsavedChangesGuard =
    Boolean(selectedTeam) || Object.keys(answers).length > 0;

  return (
    <Stack spacing={3}>
      <UnsavedChangesGuard when={showUnsavedChangesGuard} />

      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Setup
            </Typography>

            <TextField
              label="Event"
              value={eventKey}
              InputProps={{ readOnly: true }}
              helperText="Pit scouting is tied to this project's event."
            />

            <TeamAutocompleteField
              teams={teams}
              selectedTeamKey={selectedTeam?.key ?? null}
              loading={teamsLoading}
              onChange={setSelectedTeam}
            />

            {setupError ? <Alert severity="warning">{setupError}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>

      {!setupIsComplete ? (
        <Alert severity="info">
          Pick a team before saving or sharing this pit scouting form.
        </Alert>
      ) : null}

      {setupIsComplete && !questionnaireIsComplete ? (
        <Alert severity="warning">
          Complete all required questionnaire fields before saving or sharing.
        </Alert>
      ) : null}

      <QuestionnaireForm
        definition={questionnaire}
        answers={answers}
        onAnswersChange={setAnswers}
        onSubmit={async () => {}}
        showSubmitButton={false}
      />

      <MatchScoutingActionBar
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={!canSubmit}
        onReset={handleReset}
      />
    </Stack>
  );
}
