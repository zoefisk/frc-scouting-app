"use client";

import * as React from "react";
import Link from "next/link";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridToolbar,
} from "@mui/x-data-grid";
import FieldLabelWithHelp from "@/components/common/FieldLabelWithHelp";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { useToast } from "@/lib/hooks/useToast";
import { updateScoutingProjectClient } from "@/lib/firebase/client/projects";
import {
  buildBlankScoutingSchedule,
  DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE,
  generateFairScoutingSchedule,
  getQualificationMatches,
  getScheduleSlotsForMode,
  getScoutingDataCollectionStatusForMatch,
  isTbaMatchPlayed,
  normalizeScouterNames,
} from "@/lib/scouting-projects/schedule";
import {
  getMinimumScoutersForMode,
  getMinimumScoutersMessage,
  validateScoutingScheduleDocument,
} from "@/lib/scouting-projects/scouting-schedule/validation";
import type {
  MatchCollectionMode,
  ScoutingProjectDoc,
  ScoutingScheduleDoc,
  ScoutingScheduleEntry,
  ScoutingScheduleMode,
  ScoutingScheduleSlot,
} from "@/lib/scouting-projects/types";
import {
  getProjectMemberRole,
  hasMatchData,
  hasPitData,
} from "@/lib/scouting-projects/types";
import {
  countRecordedScheduleSlots,
  hasNextQualificationMatchStarted,
  ProjectMatchCoverageByMatch,
  slotHasRecordedData,
} from "@/lib/scouting-projects/matchCoverage";
import type { RawTbaMatch } from "@/lib/scouting/tba/types";
import { loadEventTeamsForScouting } from "@/lib/scouting/match/setupData";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";
import {
  getMissingProjectQuestionnaireMessage,
  projectHasConfiguredQuestionnaire,
} from "@/lib/scouting-projects/questionnaires/availability";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  title?: string;
};

type ScouterFilterMode = "any" | "all";

type DisplayRow = {
  id: string;
  matchNumber: number;
  blockIndex: number;
  isBlockStart: boolean;
  statusLabel: string;
  statusTone: "neutral" | "success";
  collectionLabel: string;
  hasAnyRecordedData: boolean;
  recordedDataCount: number;
  totalDataSlots: number;
} & Partial<Record<ScoutingScheduleSlot, string | null>>;

type PitDisplayRow = {
  id: string;
  teamKey: string;
  teamNumber: number;
  teamName: string;
  teamLocation: string;
  hasRecordedData: boolean;
  dataLabel: string;
};

const ROBOT_SLOT_LABELS: Array<{
  slot: Extract<
    ScoutingScheduleSlot,
    "red1" | "red2" | "red3" | "blue1" | "blue2" | "blue3"
  >;
  label: string;
  tone: "red" | "blue";
  dividerRight?: boolean;
}> = [
  { slot: "red1", label: "Red 1", tone: "red" },
  { slot: "red2", label: "Red 2", tone: "red" },
  { slot: "red3", label: "Red 3", tone: "red", dividerRight: true },
  { slot: "blue1", label: "Blue 1", tone: "blue" },
  { slot: "blue2", label: "Blue 2", tone: "blue" },
  { slot: "blue3", label: "Blue 3", tone: "blue" },
];

const ALLIANCE_SLOT_LABELS: Array<{
  slot: Extract<ScoutingScheduleSlot, "redAlliance" | "blueAlliance">;
  label: string;
  tone: "red" | "blue";
}> = [
  { slot: "redAlliance", label: "Red Alliance", tone: "red" },
  { slot: "blueAlliance", label: "Blue Alliance", tone: "blue" },
];

function cloneSchedule(schedule: ScoutingScheduleDoc): ScoutingScheduleDoc {
  return JSON.parse(JSON.stringify(schedule)) as ScoutingScheduleDoc;
}

function getDefaultScheduleMode(
  matchCollectionMode: MatchCollectionMode | null
): ScoutingScheduleMode {
  return matchCollectionMode ?? "robot";
}

function getMatchStatus(match: RawTbaMatch | undefined): {
  label: string;
  tone: "neutral" | "success";
} {
  if (!match) {
    return {
      label: "Unknown",
      tone: "neutral",
    };
  }

  return isTbaMatchPlayed(match)
    ? { label: "Completed", tone: "success" }
    : { label: "Upcoming", tone: "neutral" };
}

function buildDisplayRows(
  schedule: ScoutingScheduleDoc | null,
  qualificationMatches: RawTbaMatch[],
  coverageByMatch: ProjectMatchCoverageByMatch
): DisplayRow[] {
  if (!schedule) {
    return [];
  }

  const matchByNumber = new Map(
    qualificationMatches.map((match) => [match.match_number, match])
  );

  return [...schedule.matches]
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .map((entry, index) => {
      const matchStatus = getMatchStatus(matchByNumber.get(entry.matchNumber));
      const matchCoverage = coverageByMatch[entry.matchNumber];
      const scheduleSlots = getScheduleSlotsForMode(schedule.mode);
      const fallbackCollectedData =
        getScoutingDataCollectionStatusForMatch(entry);
      const recordedDataCount = matchCoverage
        ? countRecordedScheduleSlots(
            scheduleSlots as ScoutingScheduleSlot[],
            matchCoverage.positionsWithData
          )
        : fallbackCollectedData
          ? scheduleSlots.length
          : 0;
      const totalDataSlots = scheduleSlots.length;
      const hasAnyRecordedData = matchCoverage
        ? matchCoverage.hasAnyData
        : Boolean(fallbackCollectedData);

      return {
        id: `match-${entry.matchNumber}`,
        matchNumber: entry.matchNumber,
        blockIndex: Math.floor(index / DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE),
        isBlockStart: index % DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE === 0,
        statusLabel: matchStatus.label,
        statusTone: matchStatus.tone,
        collectionLabel: `${recordedDataCount}/${totalDataSlots}`,
        hasAnyRecordedData,
        recordedDataCount,
        totalDataSlots,
        ...entry.assignments,
      };
    });
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatTeamLocation(team: TeamOption): string {
  const parts = [team.city, team.state_prov, team.country].filter(
    (value): value is string => typeof value === "string" && value.trim() !== ""
  );

  return parts.length > 0 ? parts.join(", ") : "-";
}

function getAssignmentColumns(
  projectId: string,
  mode: ScoutingScheduleMode,
  scouterOptions: string[],
  editable: boolean,
  coverageByMatch: ProjectMatchCoverageByMatch,
  coverageLoaded: boolean,
  qualificationMatches: RawTbaMatch[]
): GridColDef<DisplayRow>[] {
  const slotConfigs =
    mode === "robot" ? ROBOT_SLOT_LABELS : ALLIANCE_SLOT_LABELS;

  return slotConfigs.map((config) => ({
    field: config.slot,
    headerName: config.label,
    type: "singleSelect",
    editable,
    valueOptions: scouterOptions,
    flex: 1,
    minWidth: mode === "robot" ? 120 : 180,
    headerClassName:
      config.tone === "red" ? "schedule-header-red" : "schedule-header-blue",
    cellClassName:
      config.tone === "red"
        ? `schedule-cell-red${"dividerRight" in config && config.dividerRight ? " schedule-divider-right" : ""}`
        : "schedule-cell-blue",
    renderCell: (params: GridRenderCellParams<DisplayRow>) => {
      const assignedName =
        typeof params.value === "string"
          ? params.value
          : String(params.value ?? "");
      const matchCoverage = coverageByMatch[params.row.matchNumber];
      const hasSlotData = matchCoverage
        ? slotHasRecordedData(config.slot, matchCoverage.positionsWithData)
        : false;
      const showMissingWarning =
        coverageLoaded &&
        Boolean(assignedName) &&
        !hasSlotData &&
        hasNextQualificationMatchStarted(
          params.row.matchNumber,
          qualificationMatches
        );
      const currentMatch = qualificationMatches.find(
        (match) => match.match_number === params.row.matchNumber
      );
      const showQuestionnaireLink =
        Boolean(assignedName) &&
        !editable &&
        !hasSlotData &&
        !showMissingWarning &&
        currentMatch != null &&
        !isTbaMatchPlayed(currentMatch);
      const prefillParams = new URLSearchParams({
        match: String(params.row.matchNumber),
      });

      if (config.slot !== "redAlliance" && config.slot !== "blueAlliance") {
        prefillParams.set("position", config.slot);
      }

      return (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ minWidth: 0, width: "100%" }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {assignedName || "Unassigned"}
          </Typography>

          {assignedName && showMissingWarning ? (
            <Link
              href={`/scouting-projects/${projectId}/match-scouting?${prefillParams.toString()}`}
              style={{ display: "inline-flex", color: "inherit" }}
            >
              <Tooltip
                arrow
                title="No recorded match data yet, and the next qualification match has already started. Open match scouting for this assignment."
              >
                <WarningAmberOutlinedIcon
                  sx={{ fontSize: 16, color: "warning.main" }}
                />
              </Tooltip>
            </Link>
          ) : null}

          {showQuestionnaireLink ? (
            <Link
              href={`/scouting-projects/${projectId}/match-scouting?${prefillParams.toString()}`}
              style={{ display: "inline-flex", color: "inherit" }}
            >
              <Tooltip
                arrow
                title="Open match scouting with this match preloaded"
              >
                <OpenInNewIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              </Tooltip>
            </Link>
          ) : null}
        </Stack>
      );
    },
  }));
}

export default function ScoutingSchedule({
  project,
  title = "Scouting Schedule",
}: Props) {
  const toast = useToast();
  const { user } = useAuth();
  const [qualificationMatches, setQualificationMatches] = React.useState<
    RawTbaMatch[]
  >([]);
  const [isLoadingMatches, setIsLoadingMatches] = React.useState(false);
  const [matchesError, setMatchesError] = React.useState<string | null>(null);
  const [savedSchedule, setSavedSchedule] =
    React.useState<ScoutingScheduleDoc | null>(
      project.scoutingSchedule ?? null
    );
  const [draftSchedule, setDraftSchedule] =
    React.useState<ScoutingScheduleDoc | null>(
      project.scoutingSchedule ? cloneSchedule(project.scoutingSchedule) : null
    );
  const [workingMode, setWorkingMode] = React.useState<ScoutingScheduleMode>(
    project.scoutingSchedule?.mode ??
      getDefaultScheduleMode(project.matchCollectionMode)
  );
  const [workingScouterNames, setWorkingScouterNames] = React.useState<
    string[]
  >(project.scoutingSchedule?.scouterNames ?? []);
  const [selectedScouterFilters, setSelectedScouterFilters] = React.useState<
    string[]
  >([]);
  const [scouterFilterMode, setScouterFilterMode] =
    React.useState<ScouterFilterMode>("any");
  const [filterAnchorEl, setFilterAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [isEditMode, setIsEditMode] = React.useState(!project.scoutingSchedule);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [coverageByMatch, setCoverageByMatch] =
    React.useState<ProjectMatchCoverageByMatch>({});
  const [isLoadingCoverage, setIsLoadingCoverage] = React.useState(false);
  const [eventTeams, setEventTeams] = React.useState<TeamOption[]>([]);
  const [isLoadingPitTeams, setIsLoadingPitTeams] = React.useState(false);
  const [pitTeamsError, setPitTeamsError] = React.useState<string | null>(null);
  const [pitCoverageByTeam, setPitCoverageByTeam] = React.useState<
    Record<string, boolean>
  >({});
  const [isLoadingPitCoverage, setIsLoadingPitCoverage] = React.useState(false);

  const memberRole = getProjectMemberRole(project, user?.uid);
  const canEdit = memberRole === "owner" || memberRole === "admin";
  const hasMatchQuestionnaire = projectHasConfiguredQuestionnaire(
    project,
    "match"
  );
  const hasPitQuestionnaire = projectHasConfiguredQuestionnaire(project, "pit");
  const hasAnyScheduleSetup =
    Boolean(savedSchedule) ||
    Boolean(project.scoutingSchedule) ||
    Boolean(draftSchedule) ||
    Boolean(project.scoutingSchedule?.scouterNames?.length);
  const isFilterMenuOpen = Boolean(filterAnchorEl);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      try {
        setIsLoadingMatches(true);
        setMatchesError(null);

        const response = await fetch(
          `/api/tba/event-matches/${project.eventKey}`
        );
        const data = (await response.json()) as
          | RawTbaMatch[]
          | { error?: string };

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not load event matches."
          );
        }

        if (cancelled) {
          return;
        }

        setQualificationMatches(getQualificationMatches(data));
      } catch (error) {
        console.error("Failed to load qualification matches:", error);
        if (!cancelled) {
          setMatchesError("Could not load event matches from TBA.");
          setQualificationMatches([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMatches(false);
        }
      }
    }

    void loadMatches();

    return () => {
      cancelled = true;
    };
  }, [project.eventKey]);

  React.useEffect(() => {
    const nextSavedSchedule = project.scoutingSchedule ?? null;
    setSavedSchedule(nextSavedSchedule);
    setDraftSchedule(
      nextSavedSchedule ? cloneSchedule(nextSavedSchedule) : null
    );
    setWorkingMode(
      nextSavedSchedule?.mode ??
        getDefaultScheduleMode(project.matchCollectionMode)
    );
    setWorkingScouterNames(nextSavedSchedule?.scouterNames ?? []);
    setIsEditMode(!nextSavedSchedule);
  }, [project.scoutingSchedule, project.matchCollectionMode]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCoverage() {
      try {
        setIsLoadingCoverage(true);

        const response = await fetch(
          `/api/scouting-projects/${project.id}/match-coverage`
        );
        const data = (await response.json()) as {
          coverage?: ProjectMatchCoverageByMatch;
          error?: string;
        };

        if (!response.ok || !data.coverage) {
          throw new Error(
            data.error ?? "Could not load project match coverage."
          );
        }

        if (!cancelled) {
          setCoverageByMatch(data.coverage);
        }
      } catch (error) {
        console.error("Failed to load project match coverage:", error);
        if (!cancelled) {
          setCoverageByMatch({});
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCoverage(false);
        }
      }
    }

    if (!hasMatchData(project.dataMode)) {
      setCoverageByMatch({});
      return;
    }

    void loadCoverage();

    return () => {
      cancelled = true;
    };
  }, [project.dataMode, project.id]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPitTeams() {
      try {
        setIsLoadingPitTeams(true);
        setPitTeamsError(null);

        const result = await loadEventTeamsForScouting(project.eventKey);
        if (cancelled) {
          return;
        }

        setEventTeams(
          [...result.data].sort((a, b) => a.team_number - b.team_number)
        );
      } catch (error) {
        console.error("Failed to load pit scouting teams:", error);
        if (!cancelled) {
          setEventTeams([]);
          setPitTeamsError("Could not load event teams for pit scouting.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPitTeams(false);
        }
      }
    }

    if (!hasPitData(project.dataMode)) {
      setEventTeams([]);
      setPitTeamsError(null);
      return;
    }

    void loadPitTeams();

    return () => {
      cancelled = true;
    };
  }, [project.dataMode, project.eventKey]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPitCoverage() {
      try {
        setIsLoadingPitCoverage(true);

        const response = await fetch(
          `/api/scouting-projects/${project.id}/pit-coverage`
        );
        const data = (await response.json()) as {
          coverage?: Record<string, boolean>;
          error?: string;
        };

        if (!response.ok || !data.coverage) {
          throw new Error(data.error ?? "Could not load project pit coverage.");
        }

        if (!cancelled) {
          setPitCoverageByTeam(data.coverage);
        }
      } catch (error) {
        console.error("Failed to load project pit coverage:", error);
        if (!cancelled) {
          setPitCoverageByTeam({});
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPitCoverage(false);
        }
      }
    }

    if (!hasPitData(project.dataMode)) {
      setPitCoverageByTeam({});
      return;
    }

    void loadPitCoverage();

    return () => {
      cancelled = true;
    };
  }, [project.dataMode, project.id]);

  const matchNumbers = React.useMemo(
    () => qualificationMatches.map((match) => match.match_number),
    [qualificationMatches]
  );

  const normalizedWorkingScouterNames = React.useMemo(
    () => normalizeScouterNames(workingScouterNames),
    [workingScouterNames]
  );

  const effectiveSchedule = isEditMode ? draftSchedule : savedSchedule;
  const displayRows = React.useMemo(
    () =>
      buildDisplayRows(
        effectiveSchedule,
        qualificationMatches,
        coverageByMatch
      ),
    [coverageByMatch, effectiveSchedule, qualificationMatches]
  );
  const filteredDisplayRows = React.useMemo(() => {
    if (selectedScouterFilters.length === 0) {
      return displayRows;
    }

    const slots = getScheduleSlotsForMode(
      effectiveSchedule?.mode ?? workingMode
    );

    return displayRows.filter((row) => {
      const assignedScouters = slots
        .map((slot) => row[slot])
        .filter((value): value is string => typeof value === "string");

      return scouterFilterMode === "all"
        ? selectedScouterFilters.every((scouter) =>
            assignedScouters.includes(scouter)
          )
        : selectedScouterFilters.some((scouter) =>
            assignedScouters.includes(scouter)
          );
    });
  }, [
    displayRows,
    effectiveSchedule?.mode,
    scouterFilterMode,
    selectedScouterFilters,
    workingMode,
  ]);

  const configurationNeedsRegeneration =
    isEditMode &&
    draftSchedule != null &&
    JSON.stringify(draftSchedule.scouterNames) !==
      JSON.stringify(normalizedWorkingScouterNames);

  const hasDraftSchedule =
    draftSchedule != null && draftSchedule.matches.length > 0;
  const hasSavedSchedule =
    savedSchedule != null && savedSchedule.matches.length > 0;
  const showConfigurationEditor = isEditMode || !hasSavedSchedule;
  const minimumScoutersForMode = getMinimumScoutersForMode(workingMode);

  const processRowUpdate = React.useCallback(
    (newRow: GridRowModel<DisplayRow>) => {
      if (!draftSchedule) {
        return newRow;
      }

      const slots = getScheduleSlotsForMode(draftSchedule.mode);
      const updatedMatches = draftSchedule.matches.map((entry) => {
        if (entry.matchNumber !== newRow.matchNumber) {
          return entry;
        }

        const nextAssignments: ScoutingScheduleEntry["assignments"] = {
          ...entry.assignments,
        };

        for (const slot of slots) {
          const nextValue = newRow[slot];
          nextAssignments[slot] =
            typeof nextValue === "string" && nextValue.trim().length > 0
              ? nextValue
              : null;
        }

        return {
          ...entry,
          assignments: nextAssignments,
        };
      });

      setDraftSchedule({
        ...draftSchedule,
        matches: updatedMatches,
        updatedAt: new Date().toISOString(),
      });

      return newRow;
    },
    [draftSchedule]
  );

  const handleProcessRowUpdateError = React.useCallback((error: unknown) => {
    console.error("Failed to update scouting schedule row:", error);
  }, []);

  const handleGenerateSchedule = React.useCallback(() => {
    if (matchNumbers.length === 0) {
      setSaveError(
        "No qualification matches are available for this event yet."
      );
      return;
    }

    if (normalizedWorkingScouterNames.length < minimumScoutersForMode) {
      setSaveError(getMinimumScoutersMessage(workingMode));
      return;
    }

    try {
      setDraftSchedule(
        generateFairScoutingSchedule(
          workingMode,
          matchNumbers,
          normalizedWorkingScouterNames
        )
      );
      setSaveError(null);
      setIsEditMode(true);
    } catch (error) {
      console.error("Failed to generate scouting schedule:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not generate the scouting schedule."
      );
    }
  }, [
    matchNumbers,
    minimumScoutersForMode,
    normalizedWorkingScouterNames,
    workingMode,
  ]);

  const handleStartEditing = React.useCallback(() => {
    setDraftSchedule(
      savedSchedule
        ? cloneSchedule(savedSchedule)
        : buildBlankScoutingSchedule(
            workingMode,
            matchNumbers,
            normalizedWorkingScouterNames
          )
    );
    setWorkingMode(
      savedSchedule?.mode ?? getDefaultScheduleMode(project.matchCollectionMode)
    );
    setWorkingScouterNames(savedSchedule?.scouterNames ?? []);
    setSaveError(null);
    setIsEditMode(true);
  }, [
    matchNumbers,
    normalizedWorkingScouterNames,
    project.matchCollectionMode,
    savedSchedule,
    workingMode,
  ]);

  const handleCancelEditing = React.useCallback(() => {
    setDraftSchedule(savedSchedule ? cloneSchedule(savedSchedule) : null);
    setWorkingMode(
      savedSchedule?.mode ?? getDefaultScheduleMode(project.matchCollectionMode)
    );
    setWorkingScouterNames(savedSchedule?.scouterNames ?? []);
    setSaveError(null);
    setIsEditMode(!savedSchedule);
  }, [project.matchCollectionMode, savedSchedule]);

  const handleSaveSchedule = React.useCallback(async () => {
    if (!draftSchedule) {
      setSaveError("Generate a schedule before saving.");
      return;
    }

    if (
      normalizedWorkingScouterNames.length <
      getMinimumScoutersForMode(workingMode)
    ) {
      setSaveError(getMinimumScoutersMessage(workingMode));
      return;
    }

    if (configurationNeedsRegeneration) {
      setSaveError(
        "Regenerate the schedule to apply the updated names or mode."
      );
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      validateScoutingScheduleDocument({
        mode: workingMode,
        scouterNames: normalizedWorkingScouterNames,
        matches: draftSchedule.matches,
      });

      const nextSchedule: ScoutingScheduleDoc = {
        ...draftSchedule,
        mode: workingMode,
        scouterNames: normalizedWorkingScouterNames,
        updatedAt: new Date().toISOString(),
      };

      await updateScoutingProjectClient(project.id, {
        scoutingSchedule: nextSchedule,
      });

      setSavedSchedule(nextSchedule);
      setDraftSchedule(cloneSchedule(nextSchedule));
      setIsEditMode(false);
      toast.success("Scouting schedule saved.");
    } catch (error) {
      console.error("Failed to save scouting schedule:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not save the scouting schedule.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    configurationNeedsRegeneration,
    draftSchedule,
    normalizedWorkingScouterNames,
    project.id,
    toast,
    workingMode,
  ]);

  const handleExportCsv = React.useCallback(() => {
    if (!effectiveSchedule) {
      return;
    }

    const slots = getScheduleSlotsForMode(effectiveSchedule.mode);
    const header = ["matchNumber", "matchStatus", ...slots];
    const rows = buildDisplayRows(
      effectiveSchedule,
      qualificationMatches,
      coverageByMatch
    ).map((row) => [
      row.matchNumber,
      row.statusLabel,
      ...slots.map((slot) => row[slot] ?? ""),
    ]);

    const csv = [header, ...rows]
      .map((line) =>
        line
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    downloadTextFile(`${project.eventKey}-scouting-schedule.csv`, csv);
  }, [
    coverageByMatch,
    effectiveSchedule,
    project.eventKey,
    qualificationMatches,
  ]);

  const handleOpenFilterMenu = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleCloseFilterMenu = React.useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const columns = React.useMemo<GridColDef<DisplayRow>[]>(
    () => [
      {
        field: "matchNumber",
        headerName: "Match",
        width: 96,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "statusLabel",
        headerName: "Status",
        width: 132,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<DisplayRow>) => (
          <Chip
            label={params.row.statusLabel}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor:
                params.row.statusTone === "success"
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(15,23,42,0.06)",
              color:
                params.row.statusTone === "success" ? "#166534" : "#475569",
            }}
          />
        ),
      },
      ...getAssignmentColumns(
        project.id,
        effectiveSchedule?.mode ?? workingMode,
        normalizedWorkingScouterNames,
        isEditMode && canEdit,
        coverageByMatch,
        !isLoadingCoverage,
        qualificationMatches
      ),
      {
        field: "collectionLabel",
        headerName: "Data",
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<DisplayRow>) => {
          return (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip
                label={params.row.collectionLabel}
                size="small"
                variant="outlined"
              />
              {params.row.hasAnyRecordedData ? (
                <Link
                  href={`/scouting-projects/${project.id}/analysis/matches/${params.row.matchNumber}`}
                  style={{ display: "inline-flex", color: "inherit" }}
                >
                  <Tooltip arrow title="Open match analysis">
                    <AnalyticsOutlinedIcon
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                  </Tooltip>
                </Link>
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [
      canEdit,
      coverageByMatch,
      effectiveSchedule?.mode,
      isLoadingCoverage,
      isEditMode,
      normalizedWorkingScouterNames,
      project.id,
      qualificationMatches,
      workingMode,
    ]
  );

  const pitRows = React.useMemo<PitDisplayRow[]>(
    () =>
      eventTeams.map((team) => {
        const hasRecordedData = Boolean(pitCoverageByTeam[team.key]);

        return {
          id: team.key,
          teamKey: team.key,
          teamNumber: team.team_number,
          teamName: team.nickname ?? team.name ?? "Unknown Team",
          teamLocation: formatTeamLocation(team),
          hasRecordedData,
          dataLabel: hasRecordedData ? "Collected" : "No data",
        };
      }),
    [eventTeams, pitCoverageByTeam]
  );

  const pitColumns = React.useMemo<GridColDef<PitDisplayRow>[]>(
    () => [
      {
        field: "teamNumber",
        headerName: "Team",
        width: 96,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "teamName",
        headerName: "Team Name",
        minWidth: 220,
        flex: 1,
      },
      {
        field: "teamLocation",
        headerName: "Hometown / Location",
        minWidth: 220,
        flex: 1,
      },
      {
        field: "dataLabel",
        headerName: "Data",
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<PitDisplayRow>) => {
          const linkHref = params.row.hasRecordedData
            ? `/scouting-projects/${project.id}/analysis/teams/${params.row.teamKey}`
            : `/scouting-projects/${project.id}/pit-scouting?team=${encodeURIComponent(params.row.teamKey)}`;

          return (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip
                label={params.row.dataLabel}
                size="small"
                variant="outlined"
              />
              <Link
                href={linkHref}
                style={{ display: "inline-flex", color: "inherit" }}
              >
                <Tooltip
                  arrow
                  title={
                    params.row.hasRecordedData
                      ? "Open this team's analysis page"
                      : "Open pit scouting with this team preloaded"
                  }
                >
                  {params.row.hasRecordedData ? (
                    <AnalyticsOutlinedIcon
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                  ) : (
                    <OpenInNewIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                  )}
                </Tooltip>
              </Link>
            </Stack>
          );
        },
      },
    ],
    [project.id]
  );

  const getRowClassName = React.useCallback(
    (params: { row: DisplayRow }) =>
      [
        params.row.blockIndex % 2 === 0
          ? "schedule-block-even"
          : "schedule-block-odd",
        params.row.isBlockStart ? "schedule-block-start" : "",
      ]
        .filter(Boolean)
        .join(" "),
    []
  );

  const summaryMode = effectiveSchedule?.mode ?? workingMode;

  if (
    hasMatchData(project.dataMode) &&
    hasMatchQuestionnaire &&
    !canEdit &&
    !hasAnyScheduleSetup
  ) {
    return null;
  }

  const accordionSx = {
    borderRadius: "18px !important",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
    overflow: "hidden",
    "&::before": {
      display: "none",
    },
  } as const;

  return (
    <Stack spacing={1.5}>
      {project.dataMode !== "pit" ? (
        <Accordion
          disableGutters
          disabled={!hasMatchQuestionnaire}
          sx={accordionSx}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Stack spacing={0.25}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Match schedule generation, assignment, and coverage for this
                project.
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {!hasMatchQuestionnaire ? (
              <Box sx={{ p: 2.5 }}>
                <Alert severity="info">
                  {getMissingProjectQuestionnaireMessage("match")}
                </Alert>
              </Box>
            ) : (
              <Paper sx={{ p: 2.5, borderRadius: 0, boxShadow: "none" }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Build a match schedule from real qualification matches,
                        then save it to this scouting project. Editing is manual
                        on purpose so it does not change by accident.
                      </Typography>
                    </Box>

                    <Stack
                      spacing={1.25}
                      alignItems={{ xs: "stretch", md: "flex-end" }}
                      sx={{ minWidth: { md: 360 } }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                      >
                        <Chip
                          label={`${matchNumbers.length} matches`}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: "rgba(15,23,42,0.04)",
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={
                            summaryMode === "robot"
                              ? "Robot mode"
                              : "Alliance mode"
                          }
                          size="small"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: "rgba(15,23,42,0.04)",
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        />
                        {hasSavedSchedule ? (
                          <Chip
                            label={`${savedSchedule?.scouterNames.length ?? 0} scouters`}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: "rgba(15,23,42,0.04)",
                              color: "text.secondary",
                              fontWeight: 600,
                            }}
                          />
                        ) : null}
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                      >
                        {effectiveSchedule ? (
                          <Tooltip
                            arrow
                            title={
                              selectedScouterFilters.length > 0
                                ? `Filtering by ${
                                    scouterFilterMode === "all" ? "all" : "any"
                                  } of ${selectedScouterFilters.join(", ")}`
                                : "Filter the schedule by one or more scouters"
                            }
                          >
                            <IconButton
                              aria-label="Filter schedule by scouter"
                              onClick={handleOpenFilterMenu}
                              size="small"
                              sx={{
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: 2,
                                color:
                                  selectedScouterFilters.length > 0
                                    ? "primary.main"
                                    : "text.secondary",
                                backgroundColor:
                                  selectedScouterFilters.length > 0
                                    ? "rgba(37,99,235,0.08)"
                                    : "transparent",
                              }}
                            >
                              <FilterListOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {effectiveSchedule ? (
                          <Tooltip
                            arrow
                            title="Export the current schedule to CSV, including match status and assignments."
                          >
                            <IconButton
                              aria-label="Export scouting schedule to CSV"
                              onClick={handleExportCsv}
                              size="small"
                              sx={{
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: 2,
                                color: "text.secondary",
                              }}
                            >
                              <DownloadOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        {!isEditMode && canEdit ? (
                          <>
                            {effectiveSchedule ? (
                              <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                  mx: 0.25,
                                  borderColor: "rgba(15,23,42,0.08)",
                                }}
                              />
                            ) : null}
                            <Button
                              variant="text"
                              startIcon={<EditOutlinedIcon />}
                              onClick={handleStartEditing}
                              sx={{
                                px: 1,
                                minWidth: 0,
                                color: "text.primary",
                                fontWeight: 600,
                              }}
                            >
                              Edit
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Stack>

                  {matchesError ? (
                    <Alert severity="warning">{matchesError}</Alert>
                  ) : null}

                  {isLoadingCoverage ? (
                    <Alert severity="info">
                      Checking submitted match data...
                    </Alert>
                  ) : null}

                  {saveError ? (
                    <Alert severity="error">{saveError}</Alert>
                  ) : null}

                  {configurationNeedsRegeneration ? (
                    <Alert severity="info">
                      The scouter list or schedule mode changed. Regenerate the
                      schedule before saving so the table stays consistent.
                    </Alert>
                  ) : null}

                  {!canEdit ? (
                    <Alert severity="info">
                      Schedule editing is currently read-only for your account.
                    </Alert>
                  ) : null}

                  <Stack spacing={2}>
                    {showConfigurationEditor ? (
                      <>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                        >
                          <Stack spacing={1} sx={{ minWidth: { md: 220 } }}>
                            <FieldLabelWithHelp
                              label="Schedule Mode"
                              tooltip="Robot mode creates six scouting positions per match. Alliance mode creates one red and one blue assignment per match."
                            />

                            {hasSavedSchedule ? (
                              <TextField
                                size="small"
                                value={workingMode}
                                InputProps={{ readOnly: true }}
                                helperText="Schedule mode is locked after the first save."
                              />
                            ) : (
                              <FormControl fullWidth size="small">
                                <InputLabel id="schedule-mode-label">
                                  Schedule Mode
                                </InputLabel>
                                <Select
                                  labelId="schedule-mode-label"
                                  label="Schedule Mode"
                                  value={workingMode}
                                  disabled={!isEditMode || !canEdit}
                                  onChange={(event) =>
                                    setWorkingMode(
                                      event.target.value as ScoutingScheduleMode
                                    )
                                  }
                                >
                                  <MenuItem value="robot">Robot</MenuItem>
                                  <MenuItem value="alliance">Alliance</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Stack>

                          <Stack spacing={1} sx={{ flex: 1 }}>
                            <FieldLabelWithHelp
                              label="Scouters"
                              tooltip="Add the names you want included in the schedule. The generator will distribute assignments as evenly as possible."
                            />

                            <Autocomplete
                              multiple
                              freeSolo
                              options={[]}
                              value={workingScouterNames}
                              disabled={!isEditMode || !canEdit}
                              onChange={(_, newValue) =>
                                setWorkingScouterNames(
                                  newValue.map((value) =>
                                    typeof value === "string"
                                      ? value
                                      : String(value)
                                  )
                                )
                              }
                              renderTags={(value, getTagProps) =>
                                value.map((name, index) => (
                                  <Chip
                                    {...getTagProps({ index })}
                                    key={name}
                                    label={name}
                                  />
                                ))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Type a name and press Enter"
                                  helperText={`Use Enter after each name to add it to the schedule pool. Minimum: ${minimumScoutersForMode}.`}
                                />
                              )}
                            />
                          </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Button
                            variant="contained"
                            startIcon={<RestartAltOutlinedIcon />}
                            onClick={handleGenerateSchedule}
                            disabled={
                              !isEditMode ||
                              !canEdit ||
                              isLoadingMatches ||
                              matchNumbers.length === 0
                            }
                          >
                            {hasDraftSchedule
                              ? "Regenerate Schedule"
                              : "Generate Schedule"}
                          </Button>

                          {isEditMode && canEdit ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<SaveOutlinedIcon />}
                                onClick={() => void handleSaveSchedule()}
                                disabled={
                                  isSaving ||
                                  !hasDraftSchedule ||
                                  configurationNeedsRegeneration ||
                                  isLoadingMatches
                                }
                              >
                                {isSaving ? "Saving..." : "Save Schedule"}
                              </Button>

                              <Button
                                variant="text"
                                color="inherit"
                                startIcon={<CloseOutlinedIcon />}
                                onClick={handleCancelEditing}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : null}
                        </Stack>
                      </>
                    ) : null}
                  </Stack>

                  {isLoadingMatches ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography color="text.secondary">
                        Loading match schedule from TBA...
                      </Typography>
                    </Stack>
                  ) : null}

                  {!effectiveSchedule && !isLoadingMatches ? (
                    <Alert severity="info">
                      No schedule has been generated yet. Add your scouters,
                      pick a mode, and generate the table from this event&apos;s
                      qualification matches.
                    </Alert>
                  ) : null}

                  <Menu
                    anchorEl={filterAnchorEl}
                    open={isFilterMenuOpen}
                    onClose={handleCloseFilterMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <Box sx={{ p: 1.5, width: 280 }}>
                      <Stack spacing={1}>
                        <FieldLabelWithHelp
                          label="Filter by Scouter"
                          tooltip="Choose one or more scouters, then decide whether a match should include any of them or all of them."
                        />

                        <Autocomplete
                          multiple
                          options={normalizedWorkingScouterNames}
                          value={selectedScouterFilters}
                          onChange={(_, newValue) =>
                            setSelectedScouterFilters(newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="All scouters"
                              helperText={
                                selectedScouterFilters.length > 0
                                  ? `${filteredDisplayRows.length} matches shown`
                                  : "Show all assigned matches"
                              }
                            />
                          )}
                        />

                        {selectedScouterFilters.length > 1 ? (
                          <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={scouterFilterMode}
                            onChange={(
                              _,
                              nextValue: ScouterFilterMode | null
                            ) => {
                              if (nextValue) {
                                setScouterFilterMode(nextValue);
                              }
                            }}
                            sx={{ alignSelf: "flex-start" }}
                          >
                            <ToggleButton value="any">Any</ToggleButton>
                            <ToggleButton value="all">All</ToggleButton>
                          </ToggleButtonGroup>
                        ) : null}

                        {selectedScouterFilters.length > 0 ? (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setSelectedScouterFilters([])}
                            sx={{ alignSelf: "flex-start" }}
                          >
                            Clear Filter
                          </Button>
                        ) : null}
                      </Stack>
                    </Box>
                  </Menu>

                  {effectiveSchedule ? (
                    <Stack spacing={1.5}>
                      <Box sx={{ width: "100%" }}>
                        <DataGrid<DisplayRow>
                          rows={filteredDisplayRows}
                          columns={columns}
                          editMode="row"
                          processRowUpdate={processRowUpdate}
                          onProcessRowUpdateError={handleProcessRowUpdateError}
                          getRowClassName={getRowClassName}
                          disableRowSelectionOnClick
                          disableColumnResize
                          autoHeight
                          pageSizeOptions={[10, 25, 50]}
                          initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 10,
                                page: 0,
                              },
                            },
                            sorting: {
                              sortModel: [
                                { field: "matchNumber", sort: "asc" },
                              ],
                            },
                          }}
                          slots={{
                            toolbar: GridToolbar,
                          }}
                          sx={{
                            border: 0,
                            "--DataGrid-overlayHeight": "220px",
                            "& .MuiDataGrid-toolbarContainer": {
                              px: 1,
                              py: 0.5,
                            },
                            "& .MuiDataGrid-columnHeaders": {
                              borderRadius: 2,
                            },
                            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus":
                              {
                                outline: "none",
                              },
                            "& .schedule-header-red": {
                              bgcolor: "error.light",
                              color: "error.contrastText",
                              fontWeight: 800,
                            },
                            "& .schedule-header-blue": {
                              bgcolor: "info.light",
                              color: "info.contrastText",
                              fontWeight: 800,
                            },
                            "& .schedule-cell-red": {
                              bgcolor: "rgba(244, 67, 54, 0.04)",
                            },
                            "& .schedule-cell-blue": {
                              bgcolor: "rgba(33, 150, 243, 0.04)",
                            },
                            "& .schedule-divider-right": {
                              borderRight: (theme) =>
                                `2px solid ${theme.palette.divider}`,
                            },
                            "& .schedule-block-even": {
                              backgroundColor: "rgba(15, 23, 42, 0.018)",
                            },
                            "& .schedule-block-start": {
                              borderTop: (theme) =>
                                `3px solid ${theme.palette.divider}`,
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            )}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {hasPitData(project.dataMode) ? (
        <Accordion
          disableGutters
          disabled={!hasPitQuestionnaire}
          sx={accordionSx}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Stack spacing={0.25}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Pit Scouting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placeholder section for project pit scouting tools and
                summaries.
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {!hasPitQuestionnaire ? (
              <Alert severity="info">
                {getMissingProjectQuestionnaireMessage("pit")}
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {pitTeamsError ? (
                  <Alert severity="warning">{pitTeamsError}</Alert>
                ) : null}

                {isLoadingPitTeams || isLoadingPitCoverage ? (
                  <Alert severity="info">Loading pit scouting teams...</Alert>
                ) : null}

                <Box sx={{ width: "100%" }}>
                  <DataGrid<PitDisplayRow>
                    rows={pitRows}
                    columns={pitColumns}
                    disableRowSelectionOnClick
                    disableColumnResize
                    autoHeight
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 10,
                          page: 0,
                        },
                      },
                      sorting: {
                        sortModel: [{ field: "teamNumber", sort: "asc" }],
                      },
                    }}
                    slots={{
                      toolbar: GridToolbar,
                    }}
                    sx={{
                      border: 0,
                      "--DataGrid-overlayHeight": "220px",
                      "& .MuiDataGrid-toolbarContainer": {
                        px: 1,
                        py: 0.5,
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        borderRadius: 2,
                      },
                      "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus":
                        {
                          outline: "none",
                        },
                    }}
                  />
                </Box>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      ) : null}
    </Stack>
  );
}

// TODO -- implement column groups and make them collapsible (only want to see red, only want to see blue, etc.)
