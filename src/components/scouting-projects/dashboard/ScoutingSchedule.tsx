"use client";

import * as React from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import {
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
import type { RawTbaMatch } from "@/lib/scouting/tba/types";

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
} & Partial<Record<ScoutingScheduleSlot, string | null>>;

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

function canCurrentUserEditSchedule(
  uid: string | null,
  projectId: string
): boolean {
  void uid;
  void projectId;
  // TODO: Restrict schedule editing to specific project roles once project
  // permissions are defined in Firebase and the app data model.
  return true;
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
  qualificationMatches: RawTbaMatch[]
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
      const collectionStatus = getScoutingDataCollectionStatusForMatch(entry);

      return {
        id: `match-${entry.matchNumber}`,
        matchNumber: entry.matchNumber,
        blockIndex: Math.floor(index / DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE),
        isBlockStart: index % DEFAULT_SCOUTING_SCHEDULE_BLOCK_SIZE === 0,
        statusLabel: matchStatus.label,
        statusTone: matchStatus.tone,
        collectionLabel:
          collectionStatus == null
            ? "TODO"
            : collectionStatus
              ? "Collected"
              : "Missing",
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

function getAssignmentColumns(
  mode: ScoutingScheduleMode,
  scouterOptions: string[],
  editable: boolean
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

  const canEdit = canCurrentUserEditSchedule(user?.uid ?? null, project.id);
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
    () => buildDisplayRows(effectiveSchedule, qualificationMatches),
    [effectiveSchedule, qualificationMatches]
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
    const header = [
      "matchNumber",
      "matchStatus",
      ...slots,
      "dataCollectionStatus",
    ];
    const rows = buildDisplayRows(effectiveSchedule, qualificationMatches).map(
      (row) => [
        row.matchNumber,
        row.statusLabel,
        ...slots.map((slot) => row[slot] ?? ""),
        row.collectionLabel,
      ]
    );

    const csv = [header, ...rows]
      .map((line) =>
        line
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    downloadTextFile(`${project.eventKey}-scouting-schedule.csv`, csv);
  }, [effectiveSchedule, project.eventKey, qualificationMatches]);

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
        effectiveSchedule?.mode ?? workingMode,
        normalizedWorkingScouterNames,
        isEditMode && canEdit
      ),
      {
        field: "collectionLabel",
        headerName: "Data",
        minWidth: 110,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<DisplayRow>) => (
          <Chip
            label={params.row.collectionLabel}
            size="small"
            variant="outlined"
          />
        ),
      },
    ],
    [
      canEdit,
      effectiveSchedule?.mode,
      isEditMode,
      normalizedWorkingScouterNames,
      workingMode,
    ]
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

  return (
    <Paper sx={{ p: 2.5, borderRadius: 4 }}>
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
              Build a match schedule from real qualification matches, then save
              it to this scouting project. Editing is manual on purpose so it
              does not change by accident.
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
                label={summaryMode === "robot" ? "Robot mode" : "Alliance mode"}
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
                      sx={{ mx: 0.25, borderColor: "rgba(15,23,42,0.08)" }}
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

        {matchesError ? <Alert severity="warning">{matchesError}</Alert> : null}

        {saveError ? <Alert severity="error">{saveError}</Alert> : null}

        {configurationNeedsRegeneration ? (
          <Alert severity="info">
            The scouter list or schedule mode changed. Regenerate the schedule
            before saving so the table stays consistent.
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
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                          typeof value === "string" ? value : String(value)
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
            No schedule has been generated yet. Add your scouters, pick a mode,
            and generate the table from this event&apos;s qualification matches.
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
                onChange={(_, newValue) => setSelectedScouterFilters(newValue)}
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
                  onChange={(_, nextValue: ScouterFilterMode | null) => {
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
                    sortModel: [{ field: "matchNumber", sort: "asc" }],
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
                    borderTop: (theme) => `3px solid ${theme.palette.divider}`,
                  },
                }}
              />
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
