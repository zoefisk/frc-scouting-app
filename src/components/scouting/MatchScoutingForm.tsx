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
import PerformanceRatingsCard from "@/components/scouting/form/PerformanceRatingsCard";
import AllianceMatchSetupTable from "@/components/scouting/form/AllianceMatchSetupTable";
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
  getSuggestedAllianceTeamKeysForSetup,
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
import {
  type AllianceTeamSetup,
  type MatchCollectionMode,
  type MatchRobotPosition,
  type MatchTeamPresence,
  type ScoutingSetupState,
} from "@/components/scouting/submission/types";

export type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamPresence: MatchTeamPresence;
  selectedTeam: TeamOption | null;
};

type Props = {
  questionnaire: QuestionnaireDefinition;
  projectId?: string;
  defaultEventKey?: string;
  defaultMatchNumber?: string;
  defaultScoutingPosition?: ScoutingPosition | null;
  matchCollectionMode?: MatchCollectionMode;
  lockEvent?: boolean;
  enableDraftHydration?: boolean;
  title?: string;
  description?: string;
};

export default function MatchScoutingForm({
  questionnaire,
  projectId,
  defaultEventKey = "",
  defaultMatchNumber = "",
  defaultScoutingPosition = null,
  matchCollectionMode = "robot",
  lockEvent = false,
  enableDraftHydration = true,
  title = "Match Scouting",
  description = "Configure the match, complete the questionnaire, then save or submit.",
}: Props) {
  const toast = useToast();

  const [eventKey, setEventKey] = React.useState(defaultEventKey);
  const [matchNumber, setMatchNumber] = React.useState(defaultMatchNumber);
  const [scoutingPosition, setScoutingPosition] =
    React.useState<ScoutingPosition | null>(defaultScoutingPosition);
  const [teamPresence, setTeamPresence] =
    React.useState<MatchTeamPresence>("present");

  const [robotPosition, setRobotPosition] =
    React.useState<MatchRobotPosition>(null);
  const [allianceTeams, setAllianceTeams] = React.useState<AllianceTeamSetup[]>(
    []
  );

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
      teamPresence: MatchTeamPresence;
      selectedTeam: TeamOption | null;
      allianceTeams?: AllianceTeamSetup[];
      robotPosition: MatchRobotPosition;
      answers: QuestionnaireAnswers;
    }) => {
      setEventKey(
        lockEvent ? defaultEventKey : snapshot.eventKey || defaultEventKey
      );
      setMatchNumber(snapshot.matchNumber || defaultMatchNumber);
      setScoutingPosition(snapshot.scoutingPosition ?? defaultScoutingPosition);
      setTeamPresence(snapshot.teamPresence);
      setSelectedTeam(snapshot.selectedTeam);
      setAllianceTeams(snapshot.allianceTeams ?? []);
      setRobotPosition(snapshot.robotPosition);
      setAnswers(snapshot.answers);
      setTeamWasManuallyChanged(Boolean(snapshot.selectedTeam));
      setTeamAutoDetected(false);
    },
    [defaultEventKey, defaultMatchNumber, defaultScoutingPosition, lockEvent]
  );

  const snapshot = React.useMemo(
    () => ({
      eventKey: eventKey.trim(),
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      allianceTeams,
      robotPosition,
      answers,
    }),
    [
      eventKey,
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      allianceTeams,
      robotPosition,
      answers,
    ]
  );

  const { loadedDraft, clearDraft } = useMatchScoutingDraft({
    questionnaire,
    snapshot,
    applyDraft,
    enabled: enableDraftHydration,
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
        setAllianceTeams([]);
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
          setAllianceTeams([]);
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
  }, [eventKey, matchNumber]);

  React.useEffect(() => {
    if (matchCollectionMode === "alliance") {
      return;
    }

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
  }, [
    matchCollectionMode,
    matches,
    teams,
    matchNumber,
    scoutingPosition,
    teamWasManuallyChanged,
  ]);

  React.useEffect(() => {
    if (matchCollectionMode !== "alliance") {
      setAllianceTeams([]);
      return;
    }

    const suggestedTeamKeys = getSuggestedAllianceTeamKeysForSetup({
      matches,
      matchNumber,
      scoutingPosition,
    });

    if (suggestedTeamKeys.length !== 3) {
      setAllianceTeams([]);
      return;
    }

    const nextAllianceTeams = suggestedTeamKeys.map((teamKey, index) => {
      const team = teams.find((entry) => entry.key === teamKey) ?? null;
      return { team, slot: (index + 1) as 1 | 2 | 3 };
    });

    setAllianceTeams((current) => {
      const merged = nextAllianceTeams.map((entry, index) => {
        const existing = current.find(
          (currentEntry) => currentEntry.slot === entry.slot
        );

        return {
          slot: entry.slot,
          team: entry.team,
          teamPresence: existing?.teamPresence ?? "present",
          robotPosition:
            existing?.robotPosition ??
            (index === 0 ? "left" : index === 1 ? "center" : "right"),
        };
      });

      const currentKey = JSON.stringify(current);
      const nextKey = JSON.stringify(merged);

      return currentKey === nextKey ? current : merged;
    });
  }, [matchCollectionMode, matchNumber, matches, scoutingPosition, teams]);

  const setup = React.useMemo<ScoutingSetupState>(
    () => ({
      kind: "match",
      projectId,
      matchCollectionMode,
      eventKey: eventKey.trim(),
      matchNumber,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      allianceTeams,
    }),
    [
      eventKey,
      matchCollectionMode,
      matchNumber,
      projectId,
      scoutingPosition,
      teamPresence,
      selectedTeam,
      allianceTeams,
    ]
  );

  const setupIsComplete =
    setup.eventKey !== "" &&
    (setup.matchNumber ?? "").trim() !== "" &&
    setup.scoutingPosition != null &&
    (matchCollectionMode === "alliance"
      ? allianceTeams.length === 3 &&
        allianceTeams.every(
          (entry) => entry.team != null && entry.robotPosition != null
        )
      : setup.selectedTeam != null);

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

  const handleEventChange = React.useCallback(
    (value: string) => {
      if (lockEvent) {
        return;
      }
      setEventKey(value);
      setSelectedTeam(null);
      setAllianceTeams([]);
      setMatchNumber("");
      setTeamWasManuallyChanged(false);
      setTeamAutoDetected(false);
    },
    [lockEvent]
  );

  const handleMatchNumberChange = React.useCallback((value: string) => {
    setMatchNumber(value);
    setSelectedTeam(null);
    setAllianceTeams([]);
    setTeamWasManuallyChanged(false);
    setTeamAutoDetected(false);
  }, []);

  const handleScoutingPositionChange = React.useCallback(
    (value: ScoutingPosition | null) => {
      setScoutingPosition(value);
      setSelectedTeam(null);
      setAllianceTeams([]);
      setTeamWasManuallyChanged(false);
      setTeamAutoDetected(false);
    },
    []
  );

  const handleAllianceTeamPresenceChange = React.useCallback(
    (slot: 1 | 2 | 3, nextPresence: MatchTeamPresence) => {
      setAllianceTeams((current) =>
        current.map((entry) =>
          entry.slot === slot ? { ...entry, teamPresence: nextPresence } : entry
        )
      );
    },
    []
  );

  const handleAllianceRobotPositionChange = React.useCallback(
    (slot: 1 | 2 | 3, nextPosition: MatchRobotPosition) => {
      setAllianceTeams((current) =>
        current.map((entry) =>
          entry.slot === slot
            ? { ...entry, robotPosition: nextPosition }
            : entry
        )
      );
    },
    []
  );

  function handleReset() {
    clearDraft();
    setEventKey(defaultEventKey);
    setMatchNumber(defaultMatchNumber);
    setScoutingPosition(defaultScoutingPosition);
    setRobotPosition(null);
    setTeamPresence("present");
    setTeams([]);
    setMatches([]);
    setSelectedTeam(null);
    setAllianceTeams([]);
    setTeamWasManuallyChanged(false);
    setTeamAutoDetected(false);
    setAnswers({});
    setSetupError("");
    setUsingCachedEventData(false);
  }

  const hasUnsavedProgress = React.useMemo(
    () =>
      eventKey.trim() !== defaultEventKey.trim() ||
      matchNumber.trim() !== defaultMatchNumber.trim() ||
      scoutingPosition !== defaultScoutingPosition ||
      teamPresence !== "present" ||
      robotPosition != null ||
      selectedTeam != null ||
      JSON.stringify(allianceTeams) !== "[]" ||
      Object.keys(answers).length > 0,
    [
      allianceTeams,
      answers,
      defaultEventKey,
      defaultMatchNumber,
      defaultScoutingPosition,
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
              <EventField
                value={eventKey}
                onChange={handleEventChange}
                disabled={lockEvent}
              />
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
                mode={matchCollectionMode}
              />
              {matchCollectionMode === "robot" ? (
                <RobotPositionField
                  value={robotPosition}
                  onChange={setRobotPosition}
                />
              ) : (
                <div style={{ flex: 1 }} />
              )}
            </Stack>

            {matchCollectionMode === "robot" ? (
              <>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Team Presence"
                    value={teamPresence}
                    onChange={(event) =>
                      setTeamPresence(event.target.value as MatchTeamPresence)
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
              </>
            ) : (
              <AllianceMatchSetupTable
                allianceColor={
                  scoutingPosition === "blueAlliance" ? "blue" : "red"
                }
                rows={allianceTeams}
                onPresenceChange={handleAllianceTeamPresenceChange}
                onRobotPositionChange={handleAllianceRobotPositionChange}
              />
            )}

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

      <PerformanceRatingsCard
        answers={answers}
        onAnswersChange={setAnswers}
        mode={matchCollectionMode}
        teams={
          matchCollectionMode === "alliance"
            ? allianceTeams
                .map((entry) => entry.team)
                .filter((team): team is TeamOption => team != null)
            : selectedTeam
              ? [selectedTeam]
              : []
        }
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

export type { TeamOption, ScoutingPosition, MatchTeamPresence as TeamPresence };
