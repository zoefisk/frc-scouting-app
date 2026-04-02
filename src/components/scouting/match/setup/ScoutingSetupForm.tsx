"use client";

import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useScoutingSetupForm } from "@/old-lib/scouting/hooks/useScoutingSetupForm";
import { useDetectedMatchNumber } from "@/old-lib/scouting/hooks/useDetectedMatchNumber";

import MatchNumberField from "./MatchNumberField";
import ScoutingPositionField from "./ScoutingPositionField";
import RobotPositionField, { RobotPosition } from "./RobotPositionField";
import TeamPresenceField, { TeamPresence } from "./TeamPresenceField";
import TeamAutocompleteField from "./TeamAutocompleteField";
import LookupStatusAlerts from "./LookupStatusAlerts";

import { AutonomousData } from "@/components/match-scouting/autonomous/types";
import { TeleopData } from "@/components/match-scouting/teleop/types";
import AutoNotesQuestion from "@/components/match-scouting/autonomous/AutoNotesQuestion";
import AutoAlliancePointShareQuestion from "@/components/match-scouting/autonomous/AutoAlliancePointShareQuestion";
import AutoClimbQuestion from "@/components/match-scouting/autonomous/AutoClimbQuestion";
import AutoGamePieceOutcomeQuestion from "@/components/match-scouting/autonomous/AutoPieceOutcomeQuestion";
import AutoMobilityQuestion from "@/components/match-scouting/autonomous/AutoMobilityQuestion";

import TeleopScoringEffectivenessQuestion from "@/components/match-scouting/teleop/TeleopScoringEffectivenessQuestion";
import TeleopScoringAccuracyQuestion from "@/components/match-scouting/teleop/TeleopScoringAccuracyQuestion";
import TeleopCycleSpeedQuestion from "@/components/match-scouting/teleop/TeleopCycleSpeedQuestion";
import TeleopDriverControlQuestion from "@/components/match-scouting/teleop/TeleopDriverControlQuestion";
import TeleopDefenseAbilityQuestion from "@/components/match-scouting/teleop/TeleopDefenseAbilityQuestion";
import TeleopDefenseResistanceQuestion from "@/components/match-scouting/teleop/TeleopDefenseResistanceQuestion";
import TeleopNotesQuestion from "@/components/match-scouting/teleop/TeleopNotesQuestion";
import TeleopClimbQuestion from "@/components/match-scouting/teleop/TeleopClimbQuestion";

import { FinalCommentsData } from "@/components/match-scouting/final/types";
import FinalOverallPerformanceQuestion from "@/components/match-scouting/final/FinalOverallPerformanceQuestion";
import FinalDidWellQuestion from "@/components/match-scouting/final/FinalDidWellQuestion";
import FinalCanImproveQuestion from "@/components/match-scouting/final/FinalCanImproveQuestion";
import FinalGeneralCommentsQuestion from "@/components/match-scouting/final/FinalGeneralCommentsQuestion";
import { getEventMatches, saveSubmission } from "@/old-lib/db/indexDb";
import { useToast } from "@/old-lib/hooks/useToast";
import { useSyncMode } from "@/components/providers/SyncModeProvider";
import ScoutingActionBar from "@/components/match-scouting/actions/ScoutingActionBar";
import { MatchScoutingPayload } from "@/components/match-scouting/types";

export default function ScoutingSetupForm() {
  const {
    eventKey,
    matchNumber,
    setMatchNumber,
    scoutingPosition,
    setScoutingPosition,
    eventTeams,
    teamsLoading,
    teamsError,
    selectedTeamKey,
    lookupLoading,
    lookupError,
    isAutofilled,
    usingCachedMatches,
    handleTeamChange,
  } = useScoutingSetupForm();

  const { detectedMatch, loading: detectedMatchLoading } =
    useDetectedMatchNumber(eventKey);

  const hasAppliedDetectedMatch = React.useRef(false);

  const toast = useToast();

  const { effectiveOnline } = useSyncMode();

  const [robotPosition, setRobotPosition] = React.useState<RobotPosition>(null);
  const [teamPresence, setTeamPresence] = React.useState<TeamPresence>(null);
  const [isOnline, setIsOnline] = React.useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  const selectedTeam =
    eventTeams.find((team) => team.key === selectedTeamKey) ?? null;

  const [autoData, setAutoData] = React.useState<AutonomousData>({
    mobility: null,
    gamePieceOutcome: null,
    climb: null,
    alliancePointShare: 0,
    notes: "",
  });

  const [teleopData, setTeleopData] = React.useState<TeleopData>({
    scoringEffectiveness: 0,
    scoringAccuracy: 0,
    cycleSpeed: 0,
    driverControl: 0,
    playedDefense: null,
    defenseAbility: null,
    wasDefended: null,
    defenseResistance: null,
    climb: null,
    notes: "",
  });

  const [finalCommentsData, setFinalCommentsData] =
    React.useState<FinalCommentsData>({
      overallPerformance: 3,
      didWell: "",
      canImprove: "",
      generalComments: "",
    });

  const [matches, setMatches] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadMatches() {
      if (!eventKey) return;

      const cachedMatches = await getEventMatches<any[]>(eventKey);
      setMatches(cachedMatches ?? []);
    }

    loadMatches();
  }, [eventKey]);

  const maxMatchNumber = React.useMemo(() => {
    if (!matches || matches.length === 0) return null;

    const qmMatches = matches.filter((m: any) => m.comp_level === "qm");

    if (qmMatches.length === 0) return null;

    return Math.max(...qmMatches.map((m: any) => m.match_number));
  }, [matches]);

  React.useEffect(() => {
    if (hasAppliedDetectedMatch.current) return;
    if (detectedMatch == null) return;
    if (matchNumber !== "") return;

    setMatchNumber(String(detectedMatch));
    hasAppliedDetectedMatch.current = true;
  }, [detectedMatch, matchNumber, setMatchNumber]);

  React.useEffect(() => {
    hasAppliedDetectedMatch.current = false;
  }, [eventKey]);

  React.useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const setupComplete =
    !!matchNumber &&
    !!scoutingPosition &&
    !!selectedTeamKey &&
    !!robotPosition &&
    !!teamPresence;

  const autoComplete =
    teamPresence !== "present" ||
    (autoData.mobility !== null &&
      (autoData.mobility !== "yes" ||
        (autoData.gamePieceOutcome !== null && autoData.climb !== null)));

  const teleopComplete =
    teamPresence !== "present" ||
    (teleopData.climb !== null &&
      teleopData.playedDefense !== null &&
      teleopData.wasDefended !== null);

  const finalCommentsComplete =
    finalCommentsData.overallPerformance >= 1 &&
    finalCommentsData.didWell.trim() !== "" &&
    finalCommentsData.canImprove.trim() !== "" &&
    finalCommentsData.generalComments.trim() !== "";

  const formComplete =
    setupComplete && autoComplete && teleopComplete && finalCommentsComplete;

  const handleResetForm = React.useCallback(() => {
    setMatchNumber(detectedMatch != null ? String(detectedMatch) : "");
    setScoutingPosition("");
    handleTeamChange(null);
    setRobotPosition(null);
    setTeamPresence(null);

    setAutoData({
      mobility: null,
      gamePieceOutcome: null,
      climb: null,
      alliancePointShare: 0,
      notes: "",
    });

    setTeleopData({
      scoringEffectiveness: 0,
      scoringAccuracy: 0,
      cycleSpeed: 0,
      driverControl: 0,
      playedDefense: null,
      defenseAbility: null,
      wasDefended: null,
      defenseResistance: null,
      climb: null,
      notes: "",
    });

    setFinalCommentsData({
      overallPerformance: 3,
      didWell: "",
      canImprove: "",
      generalComments: "",
    });

    hasAppliedDetectedMatch.current = true;
  }, [detectedMatch, setMatchNumber, setScoutingPosition, handleTeamChange]);

  const matchScoutingPayload: MatchScoutingPayload = {
    eventKey,
    matchNumber,
    scoutingPosition,
    selectedTeamKey,
    teamNumber: selectedTeam?.team_number ?? null,
    teamName: selectedTeam?.nickname ?? "",
    robotPosition,
    teamPresence,
    autoData,
    teleopData,
    finalCommentsData,
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Scouting Setup
      </Typography>

      <Typography color="text.secondary">
        Event is currently set to <strong>{eventKey}</strong>. Choose a match
        and scouting position. If lookup works, the team will be filled
        automatically. Otherwise, select it manually.
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Match Setup</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="flex-start"
              >
                <Box sx={{ flex: "0 0 auto" }}>
                  <MatchNumberField
                    value={matchNumber}
                    onChange={setMatchNumber}
                    maxMatchNumber={maxMatchNumber}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <ScoutingPositionField
                    value={scoutingPosition}
                    onChange={setScoutingPosition}
                  />
                </Box>
              </Stack>

              {detectedMatchLoading && (
                <Typography variant="body2" color="text.secondary">
                  Detecting current match...
                </Typography>
              )}
            </Stack>

            <LookupStatusAlerts
              teamsLoading={teamsLoading}
              lookupLoading={lookupLoading}
              teamsError={teamsError}
              lookupError={lookupError}
              isAutofilled={isAutofilled}
            />

            {usingCachedMatches && (
              <Alert severity="info">
                Using cached event data for team autofill.
              </Alert>
            )}

            <TeamAutocompleteField
              teams={eventTeams}
              selectedTeamKey={selectedTeamKey}
              loading={teamsLoading}
              disabled={teamsLoading || eventTeams.length === 0}
              onChange={handleTeamChange}
            />

            <RobotPositionField
              value={robotPosition}
              onChange={setRobotPosition}
            />

            <TeamPresenceField
              value={teamPresence}
              onChange={setTeamPresence}
            />

            {teamPresence === "present" && (
              <Alert severity="info">
                Team is marked present. More scouting questions will appear
                below.
              </Alert>
            )}

            {teamPresence === "no_show" && (
              <Alert severity="warning">
                Team marked as no-show. Autonomous and teleop sections are
                skipped.
              </Alert>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {teamPresence === "present" && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Autonomous</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Stack spacing={3}>
              <AutoMobilityQuestion
                value={autoData.mobility}
                onChange={(val) =>
                  setAutoData((prev) => ({
                    ...prev,
                    mobility: val,
                    ...(val !== "yes"
                      ? {
                          gamePieceOutcome: null,
                          climb: null,
                          alliancePointShare: 0,
                        }
                      : {}),
                  }))
                }
              />

              {autoData.mobility === "yes" && (
                <>
                  <AutoGamePieceOutcomeQuestion
                    value={autoData.gamePieceOutcome}
                    onChange={(val) =>
                      setAutoData((prev) => ({
                        ...prev,
                        gamePieceOutcome: val,
                      }))
                    }
                  />

                  <AutoClimbQuestion
                    value={autoData.climb}
                    onChange={(val) =>
                      setAutoData((prev) => ({
                        ...prev,
                        climb: val,
                      }))
                    }
                  />

                  <AutoAlliancePointShareQuestion
                    value={autoData.alliancePointShare}
                    onChange={(val) =>
                      setAutoData((prev) => ({
                        ...prev,
                        alliancePointShare: val,
                      }))
                    }
                  />
                </>
              )}

              <AutoNotesQuestion
                value={autoData.notes}
                onChange={(val) =>
                  setAutoData((prev) => ({
                    ...prev,
                    notes: val,
                  }))
                }
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {teamPresence === "present" && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Teleoperated</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Stack spacing={3}>
              <TeleopScoringEffectivenessQuestion
                value={teleopData.scoringEffectiveness}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    scoringEffectiveness: val,
                  }))
                }
              />

              <TeleopScoringAccuracyQuestion
                value={teleopData.scoringAccuracy}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    scoringAccuracy: val,
                  }))
                }
              />

              <TeleopCycleSpeedQuestion
                value={teleopData.cycleSpeed}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    cycleSpeed: val,
                  }))
                }
              />

              <TeleopDriverControlQuestion
                value={teleopData.driverControl}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    driverControl: val,
                  }))
                }
              />

              <TeleopDefenseAbilityQuestion
                value={teleopData.defenseAbility}
                playedDefense={teleopData.playedDefense}
                onPlayedDefenseChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    playedDefense: val,
                  }))
                }
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    defenseAbility: val,
                  }))
                }
              />

              <TeleopDefenseResistanceQuestion
                value={teleopData.defenseResistance}
                wasDefended={teleopData.wasDefended}
                onWasDefendedChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    wasDefended: val,
                  }))
                }
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    defenseResistance: val,
                  }))
                }
              />

              <TeleopClimbQuestion
                value={teleopData.climb}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    climb: val,
                  }))
                }
              />

              <TeleopNotesQuestion
                value={teleopData.notes}
                onChange={(val) =>
                  setTeleopData((prev: TeleopData) => ({
                    ...prev,
                    notes: val,
                  }))
                }
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>Final Comments</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={3}>
            <FinalOverallPerformanceQuestion
              value={finalCommentsData.overallPerformance}
              onChange={(val) =>
                setFinalCommentsData((prev) => ({
                  ...prev,
                  overallPerformance: val,
                }))
              }
            />

            <FinalDidWellQuestion
              value={finalCommentsData.didWell}
              onChange={(val) =>
                setFinalCommentsData((prev) => ({
                  ...prev,
                  didWell: val,
                }))
              }
            />

            <FinalCanImproveQuestion
              value={finalCommentsData.canImprove}
              onChange={(val) =>
                setFinalCommentsData((prev) => ({
                  ...prev,
                  canImprove: val,
                }))
              }
            />

            <FinalGeneralCommentsQuestion
              value={finalCommentsData.generalComments}
              onChange={(val) =>
                setFinalCommentsData((prev) => ({
                  ...prev,
                  generalComments: val,
                }))
              }
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {formComplete && (
        <ScoutingActionBar
          effectiveOnline={effectiveOnline}
          payload={matchScoutingPayload}
          onReset={handleResetForm}
        />
      )}
    </Stack>
  );
}
