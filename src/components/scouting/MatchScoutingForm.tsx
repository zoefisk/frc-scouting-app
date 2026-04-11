"use client";

import React from "react";
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import QuestionnaireForm from "@/components/scouting/form/QuestionnaireForm";
import EventField from "@/components/scouting/form/fields/match-info/EventField";
import MatchNumberField from "@/components/scouting/form/fields/match-info/MatchNumberField";
import ScoutingPositionField, {
  type ScoutingPosition,
} from "@/components/scouting/form/fields/match-info/ScoutingPositionField";
import RobotPositionField from "@/components/scouting/form/fields/match-info/RobotPositionField";
import TeamAutocompleteField from "@/components/scouting/form/fields/match-info/TeamAutocompleteField";

import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaire/validators";
import {
  getSuggestedCurrentMatchNumber,
  getSuggestedTeamKeyForSetup,
  loadEventMatchesForScouting,
  loadEventTeamsForScouting,
  type RawTbaMatch,
} from "@/lib/scouting/match/setupData";
import { useToast } from "@/lib/hooks/useToast";
import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";
import { useMatchScoutingDraft } from "@/lib/scouting/match/useMatchScoutingDraft";
import MatchScoutingActionBar from "@/components/scouting/submission/MatchScoutingActionBar";
import UnsavedChangesGuard from "@/components/app/guards/UnsavedChangesGuard";
import { ScoutingSetupState } from "@/components/scouting/submission/types";

type TeamPresence = "present" | "absent" | "surrogate";

export type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamPresence: TeamPresence;
  selectedTeam: TeamOption | null;
};

type Props = {
  questionnaire: QuestionnaireDefinition;
  projectId?: string;
  defaultEventKey?: string;
  title?: string;
  description?: string;
};

export default function MatchScoutingForm({
  questionnaire,
  projectId,
  defaultEventKey = "",
  title = "Match Scouting",
  description = "Configure the match, complete the questionnaire, then save or submit.",
}: Props) {
  const toast = useToast();

  const [eventKey, setEventKey] = React.useState(defaultEventKey);
  const [matchNumber, setMatchNumber] = React.useState("");
  const [scoutingPosition, setScoutingPosition] =
    React.useState<ScoutingPosition | null>(null);
  const [teamPresence, setTeamPresence] =
    React.useState<TeamPresence>("present");

  const [robotPosition, setRobotPosition] = React.useState<
    "left" | "center" | "right" | null
  >(null);

  const [teams, setTeams] = React.useState<TeamOption[]>([]);
  const [matches, setMatches] = React.useState<RawTbaMatch[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [setupError, setSetupError] = React.useState("");
  const [usingCachedEventData, setUsingCachedEventData] = React.useState(false);

  const [selectedTeam, setSelectedTeam] = React.useState<TeamOption | null>(
    null
  );
  const [teamWasManuallyChanged, setTeamWasManuallyChanged] =
    React.useState(false);
  const [teamAutoDetected, setTeamAutoDetected] = React.useState(false);

  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>({});

  const applyDraft = React.useCallback(
    (snapshot: {
      eventKey: string;
      matchNumber: string;
      scoutingPosition: ScoutingPosition | null;
      teamPresence: TeamPresence;
      selectedTeam: TeamOption | null;
      robotPosition: "left" | "center" | "right" | null;
      answers: QuestionnaireAnswers;
    }) => {
      setEventKey(snapshot.eventKey || defaultEventKey);
      setMatchNumber(snapshot.matchNumber);
      setScoutingPosition(snapshot.scoutingPosition);
      setTeamPresence(snapshot.teamPresence);
      setSelectedTeam(snapshot.selectedTeam);
      setRobotPosition(snapshot.robotPosition);
      setAnswers(snapshot.answers);
      setTeamWasManuallyChanged(Boolean(snapshot.selectedTeam));
      setTeamAutoDetected(false);
    },
    [defaultEventKey]
  );

  const snapshot = React.useMemo(
    () => ({
      eventKey: eventKey.trim(),
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      robotPosition,
      answers,
    }),
    [
      eventKey,
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      robotPosition,
      answers,
    ]
  );

  const { loadedDraft, clearDraft } = useMatchScoutingDraft({
    questionnaire,
    snapshot,
    applyDraft,
  });

  const hasShownLoadedDraftToastRef = React.useRef(false);

  React.useEffect(() => {
    if (loadedDraft && !hasShownLoadedDraftToastRef.current) {
      toast.info("Loaded an in-progress scouting form.");
      hasShownLoadedDraftToastRef.current = true;
    }
  }, [loadedDraft, toast]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadSetupData() {
      if (!eventKey.trim()) {
        setTeams([]);
        setMatches([]);
        setSelectedTeam(null);
        setSetupError("");
        setUsingCachedEventData(false);
        return;
      }

      try {
        setTeamsLoading(true);
        setSetupError("");

        const [teamsResult, matchesResult] = await Promise.all([
          loadEventTeamsForScouting(eventKey.trim()),
          loadEventMatchesForScouting(eventKey.trim()),
        ]);

        if (cancelled) {
          return;
        }

        setTeams(teamsResult.data);
        setMatches(matchesResult.data);
        setUsingCachedEventData(
          teamsResult.fromCache || matchesResult.fromCache
        );

        if (!matchNumber) {
          const suggestedMatch = getSuggestedCurrentMatchNumber(
            matchesResult.data
          );
          if (suggestedMatch != null) {
            setMatchNumber(String(suggestedMatch));
          }
        }
      } catch (error) {
        console.error("Failed to load setup data:", error);

        if (!cancelled) {
          setTeams([]);
          setMatches([]);
          setSelectedTeam(null);
          setSetupError("Could not load event data.");
          setUsingCachedEventData(false);
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false);
        }
      }
    }

    loadSetupData();

    return () => {
      cancelled = true;
    };
  }, [eventKey]);

  React.useEffect(() => {
    if (teamWasManuallyChanged) {
      return;
    }

    const suggestedTeamKey = getSuggestedTeamKeyForSetup({
      matches,
      matchNumber,
      scoutingPosition,
    });

    if (!suggestedTeamKey) {
      setTeamAutoDetected(false);
      setSelectedTeam(null);
      return;
    }

    const suggestedTeam =
      teams.find((team) => team.key === suggestedTeamKey) ?? null;

    setSelectedTeam(suggestedTeam);
    setTeamAutoDetected(Boolean(suggestedTeam));
  }, [matches, teams, matchNumber, scoutingPosition, teamWasManuallyChanged]);

  const setup = React.useMemo<ScoutingSetupState>(
    () => ({
      kind: "match",
      projectId,
      eventKey: eventKey.trim(),
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
    }),
    [
      eventKey,
      matchNumber,
      projectId,
      scoutingPosition,
      teamPresence,
      selectedTeam,
    ]
  );

  const setupIsComplete =
    setup.eventKey !== "" &&
    (setup.matchNumber ?? "").trim() !== "" &&
    setup.scoutingPosition != null &&
    setup.selectedTeam != null;

  const questionnaireErrors = React.useMemo(
    () => validateQuestionnaireAnswers(questionnaire, answers),
    [questionnaire, answers]
  );

  const questionnaireIsComplete = Object.keys(questionnaireErrors).length === 0;

  const canSubmit = setupIsComplete && questionnaireIsComplete;

  const maxQualificationMatchNumber = React.useMemo(() => {
    const qmMatches = matches.filter((match) => match.comp_level === "qm");
    if (qmMatches.length === 0) {
      return null;
    }
    return Math.max(...qmMatches.map((match) => match.match_number));
  }, [matches]);

  const handleTeamChange = React.useCallback((team: TeamOption | null) => {
    setSelectedTeam(team);
    setTeamWasManuallyChanged(true);
    setTeamAutoDetected(false);
  }, []);

  const handleEventChange = React.useCallback((value: string) => {
    setEventKey(value);
    setSelectedTeam(null);
    setMatchNumber("");
    setTeamWasManuallyChanged(false);
    setTeamAutoDetected(false);
  }, []);

  const handleMatchNumberChange = React.useCallback((value: string) => {
    setMatchNumber(value);
    setSelectedTeam(null);
    setTeamWasManuallyChanged(false);
    setTeamAutoDetected(false);
  }, []);

  const handleScoutingPositionChange = React.useCallback(
    (value: ScoutingPosition | null) => {
      setScoutingPosition(value);
      setSelectedTeam(null);
      setTeamWasManuallyChanged(false);
      setTeamAutoDetected(false);
    },
    []
  );

  function handleReset() {
    clearDraft();
    setEventKey(defaultEventKey);
    setMatchNumber("");
    setScoutingPosition(null);
    setRobotPosition(null);
    setTeamPresence("present");
    setTeams([]);
    setMatches([]);
    setSelectedTeam(null);
    setTeamWasManuallyChanged(false);
    setTeamAutoDetected(false);
    setAnswers({});
    setSetupError("");
    setUsingCachedEventData(false);
  }

  const hasUnsavedProgress = React.useMemo(
    () =>
      eventKey.trim() !== defaultEventKey.trim() ||
      matchNumber.trim() !== "" ||
      scoutingPosition != null ||
      teamPresence !== "present" ||
      robotPosition != null ||
      selectedTeam != null ||
      Object.keys(answers).length > 0,
    [
      answers,
      defaultEventKey,
      eventKey,
      matchNumber,
      robotPosition,
      scoutingPosition,
      selectedTeam,
      teamPresence,
    ]
  );

  return (
    <Stack spacing={3}>
      <UnsavedChangesGuard when={hasUnsavedProgress} />

      <div>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>
      </div>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Match Setup
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <EventField value={eventKey} onChange={handleEventChange} />
              <MatchNumberField
                value={matchNumber}
                onChange={handleMatchNumberChange}
                maxMatchNumber={maxQualificationMatchNumber}
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <ScoutingPositionField
                value={scoutingPosition}
                onChange={handleScoutingPositionChange}
              />
              <RobotPositionField
                value={robotPosition}
                onChange={setRobotPosition}
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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

              <div style={{ flex: 1 }} />
            </Stack>

            <TeamAutocompleteField
              teams={teams}
              selectedTeamKey={selectedTeam?.key ?? null}
              loading={teamsLoading}
              autoDetected={teamAutoDetected}
              onChange={handleTeamChange}
            />

            {usingCachedEventData && (
              <Alert severity="info">
                Event data was loaded from offline cache.
              </Alert>
            )}

            {setupError && <Alert severity="error">{setupError}</Alert>}

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
        answers={answers}
        onAnswersChange={setAnswers}
        onSubmit={async () => {
          // Saving/submission is handled by the action bar below.
        }}
        showSubmitButton={false}
      />

      <MatchScoutingActionBar
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={!canSubmit}
        effectiveOnline={true}
        onReset={handleReset}
        onSuccess={clearDraft}
      />
    </Stack>
  );
}

export type { TeamOption, ScoutingPosition, TeamPresence };
