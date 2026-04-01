"use client";

import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";

import {
  DndContext,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAppSetting, saveAppSetting } from "@/lib/db";
import { getOfflineEventOptions } from "@/lib/offline/getOfflineEventOptions";
import { useSyncMode } from "@/components/providers/SyncModeProvider";

type EventOption = {
  key: string;
  name: string;
};

type RankingRow = {
  rank: number;
  team_key: string;
};

type RankingsResponse = {
  rankings?: RankingRow[];
};

type EventTeam = {
  key: string;
  team_number: number;
  nickname?: string;
};

type AllianceTeam = {
  originalRank: number;
  teamKey: string;
  teamNumber: number;
  nickname: string;
  reasoning: string;
};

type Props = {
  myTeamNumber?: number;
  defaultYear?: number;
};

const ALLIANCE_PICKER_YEAR_KEY = "alliancePickerYear";
const ALLIANCE_PICKER_EVENT_KEY = "alliancePickerEventKey";

function escapeCsv(value: unknown) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

type SortableRowProps = {
  team: AllianceTeam;
  index: number;
  totalTeams: number;
  onReasoningChange: (teamKey: string, reasoning: string) => void;
  onMoveToTop: (index: number) => void;
  onMoveToBottom: (index: number) => void;
  onRemove: (teamKey: string) => void;
  onOpenDetails: (team: AllianceTeam) => void;
};

function SortableTeamRow({
  team,
  index,
  totalTeams,
  onReasoningChange,
  onMoveToTop,
  onMoveToBottom,
  onRemove,
  onOpenDetails,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.teamKey });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 1.25,
        py: 0.875,
        backgroundColor: "background.paper",
        opacity: isDragging ? 0 : 1,
        visibility: isDragging ? "hidden" : "visible",
        zIndex: isDragging ? 1 : "auto",
        boxShadow: isDragging ? 1 : 0,
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
        sx={{
          minWidth: 0,
          flexShrink: 1,
          flexGrow: 1,
        }}
      >
        <Box
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 1,
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            flexShrink: 0,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ minWidth: 0, flexShrink: 1 }}
        >
          <Chip label={`Pick ${index + 1}`} color="primary" size="small" />
          <Chip label={`Rank ${team.originalRank}`} size="small" />
          <Chip label={`#${team.teamNumber}`} size="small" />
          <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
            {team.nickname}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexShrink: 0, ml: "auto" }}
        >
          <IconButton
            size="small"
            onClick={() => onMoveToTop(index)}
            disabled={index === 0}
            title="Bring to top"
          >
            <VerticalAlignTopIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onMoveToBottom(index)}
            disabled={index === totalTeams - 1}
            title="Bring to bottom"
          >
            <VerticalAlignBottomIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onOpenDetails(team)}
            title="View details"
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onRemove(team.teamKey)}
            title="Remove team"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function AlliancePicker({
  myTeamNumber = 3461,
  defaultYear = 2026,
}: Props) {
  const [year, setYear] = React.useState(String(defaultYear));
  const [events, setEvents] = React.useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<EventOption | null>(
    null
  );

  const [teams, setTeams] = React.useState<AllianceTeam[]>([]);
  const [removedTeams, setRemovedTeams] = React.useState<AllianceTeam[]>([]);

  const [loadingEvents, setLoadingEvents] = React.useState(false);
  const [loadingRankings, setLoadingRankings] = React.useState(false);
  const [error, setError] = React.useState("");

  const { effectiveOnline } = useSyncMode();

  const [detailTeam, setDetailTeam] = React.useState<AllianceTeam | null>(null);
  const [activeTeamKey, setActiveTeamKey] = React.useState<string | null>(null);

  const [settingsLoaded, setSettingsLoaded] = React.useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 0,
      },
    })
  );

  React.useEffect(() => {
    async function loadSavedSettings() {
      try {
        const savedYear = await getAppSetting<string>(ALLIANCE_PICKER_YEAR_KEY);
        const savedEventKey = await getAppSetting<string | null>(
          ALLIANCE_PICKER_EVENT_KEY
        );

        if (typeof savedYear === "string") {
          setYear(savedYear);
        } else {
          setYear(String(defaultYear));
        }

        if (typeof savedEventKey === "string") {
          setSelectedEvent({ key: savedEventKey, name: savedEventKey });
        } else {
          setSelectedEvent(null);
        }
      } catch (err) {
        console.error("Failed to load alliance picker settings:", err);
        setYear(String(defaultYear));
        setSelectedEvent(null);
      } finally {
        setSettingsLoaded(true);
      }
    }

    loadSavedSettings();
  }, [defaultYear]);

  React.useEffect(() => {
    if (!settingsLoaded) return;

    async function persistYear() {
      try {
        await saveAppSetting(ALLIANCE_PICKER_YEAR_KEY, year);
      } catch (err) {
        console.error("Failed to save alliance picker year:", err);
      }
    }

    persistYear();
  }, [year, settingsLoaded]);

  React.useEffect(() => {
    if (!settingsLoaded) return;

    async function persistEvent() {
      try {
        await saveAppSetting(
          ALLIANCE_PICKER_EVENT_KEY,
          selectedEvent?.key ?? null
        );
      } catch (err) {
        console.error("Failed to save alliance picker event:", err);
      }
    }

    persistEvent();
  }, [selectedEvent, settingsLoaded]);

  React.useEffect(() => {
    async function loadEvents() {
      if (!year) return;

      if (!effectiveOnline) {
        const offlineEvents = await getOfflineEventOptions(year);
        setEvents(offlineEvents);
        return;
      }

      const res = await fetch(`/api/tba/events/${year}`);
      if (!res.ok) {
        throw new Error("Could not load events.");
      }

      const data: EventOption[] = await res.json();
      setEvents(data);
    }

    loadEvents();
  }, [year, effectiveOnline]);

  React.useEffect(() => {
    async function loadRankingsAndTeams() {
      if (!selectedEvent?.key) {
        setTeams([]);
        setRemovedTeams([]);
        return;
      }

      setLoadingRankings(true);
      setError("");
      setTeams([]);
      setRemovedTeams([]);

      try {
        const [rankingsRes, teamsRes] = await Promise.all([
          fetch(`/api/tba/event-rankings/${selectedEvent.key}`),
          fetch(`/api/tba/event-teams/${selectedEvent.key}`),
        ]);

        if (!rankingsRes.ok) {
          throw new Error("Could not load rankings.");
        }

        if (!teamsRes.ok) {
          throw new Error("Could not load event teams.");
        }

        const rankingsData: RankingsResponse = await rankingsRes.json();
        const eventTeams: EventTeam[] = await teamsRes.json();

        const teamMap = new Map(
          eventTeams.map((team) => [
            team.key,
            {
              teamNumber: team.team_number,
              nickname: team.nickname ?? `Team ${team.team_number}`,
            },
          ])
        );

        const rankings = rankingsData.rankings ?? [];

        const mapped: AllianceTeam[] = rankings
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((row) => {
            const teamInfo = teamMap.get(row.team_key);
            const fallbackNumber = Number(row.team_key.replace("frc", ""));

            return {
              originalRank: row.rank,
              teamKey: row.team_key,
              teamNumber: teamInfo?.teamNumber ?? fallbackNumber,
              nickname: teamInfo?.nickname ?? `Team ${fallbackNumber}`,
              reasoning: "",
            };
          });

        setTeams(mapped);
      } catch (err) {
        console.error(err);
        setError("Could not load ranked teams for this event.");
      } finally {
        setLoadingRankings(false);
      }
    }

    loadRankingsAndTeams();
  }, [selectedEvent]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTeamKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTeamKey(null);

    if (!over || active.id === over.id) return;

    setTeams((prev) => {
      const oldIndex = prev.findIndex((team) => team.teamKey === active.id);
      const newIndex = prev.findIndex((team) => team.teamKey === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleDragCancel = () => {
    setActiveTeamKey(null);
  };

  const updateReasoning = (teamKey: string, reasoning: string) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.teamKey === teamKey ? { ...team, reasoning } : team
      )
    );
  };

  const moveToTop = (index: number) => {
    setTeams((prev) => {
      if (index <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const moveToBottom = (index: number) => {
    setTeams((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.push(item);
      return copy;
    });
  };

  const removeTeam = (teamKey: string) => {
    setTeams((prev) => {
      const found = prev.find((team) => team.teamKey === teamKey);
      if (!found) return prev;

      setRemovedTeams((prevRemoved) => {
        if (prevRemoved.some((team) => team.teamKey === teamKey)) {
          return prevRemoved;
        }
        return [...prevRemoved, found];
      });

      return prev.filter((team) => team.teamKey !== teamKey);
    });
  };

  const restoreTeam = (teamKey: string) => {
    setRemovedTeams((prevRemoved) => {
      const found = prevRemoved.find((team) => team.teamKey === teamKey);
      if (!found) return prevRemoved;

      setTeams((prevTeams) => [...prevTeams, found]);
      return prevRemoved.filter((team) => team.teamKey !== teamKey);
    });
  };

  const removeMyTeam = () => {
    const myTeam = teams.find((team) => team.teamNumber === myTeamNumber);
    if (myTeam) {
      removeTeam(myTeam.teamKey);
    }
  };

  const exportCsv = () => {
    const headers = [
      "pick_order",
      "original_rank",
      "team_number",
      "team_name",
      "reasoning",
    ];

    const rows = teams.map((team, index) => [
      index + 1,
      team.originalRank,
      team.teamNumber,
      team.nickname,
      team.reasoning,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const eventPart = selectedEvent?.key ?? "alliance-picker";
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventPart}-alliance-picker.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  const activeTeam =
    activeTeamKey != null
      ? (teams.find((team) => team.teamKey === activeTeamKey) ?? null)
      : null;

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", lg: "center" }}
      >
        <TextField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          size="small"
          sx={{ width: 120 }}
        />

        <Autocomplete
          options={events}
          value={selectedEvent}
          onChange={(_, newValue) => setSelectedEvent(newValue)}
          loading={loadingEvents}
          getOptionLabel={(option) => `${option.name} (${option.key})`}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          renderInput={(params) => (
            <TextField {...params} label="Event" size="small" />
          )}
          sx={{ minWidth: 320, flex: 1 }}
        />

        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={exportCsv}
          disabled={teams.length === 0}
          sx={{ minWidth: 150 }}
        >
          Download CSV
        </Button>

        <Button
          variant="outlined"
          startIcon={<PictureAsPdfOutlinedIcon />}
          onClick={exportPdf}
          disabled={teams.length === 0}
          sx={{ minWidth: 140 }}
        >
          Export PDF
        </Button>
      </Stack>

      {error && <Alert severity="warning">{error}</Alert>}

      {loadingRankings && (
        <Alert severity="info">Loading ranked teams...</Alert>
      )}

      {selectedEvent && !loadingRankings && (
        <Typography color="text.secondary">
          Ranked teams for <strong>{selectedEvent.name}</strong>. Drag to
          reorder, add reasoning, remove teams, and restore them later if
          needed.
        </Typography>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={teams.map((team) => team.teamKey)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={0.75}>
            {teams.map((team, index) => (
              <SortableTeamRow
                key={team.teamKey}
                team={team}
                index={index}
                totalTeams={teams.length}
                onReasoningChange={updateReasoning}
                onMoveToTop={moveToTop}
                onMoveToBottom={moveToBottom}
                onRemove={removeTeam}
                onOpenDetails={setDetailTeam}
              />
            ))}
          </Stack>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeTeam ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1.25,
                py: 0.875,
                backgroundColor: "background.paper",
                boxShadow: 6,
                minWidth: 420,
                maxWidth: 640,
                transform: "rotate(1deg)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    color: "text.secondary",
                    flexShrink: 0,
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </Box>

                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ minWidth: 0, flexShrink: 1 }}
                >
                  <Chip
                    label={`Pick ${
                      teams.findIndex((t) => t.teamKey === activeTeam.teamKey) +
                      1
                    }`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={`Rank ${activeTeam.originalRank}`}
                    size="small"
                  />
                  <Chip label={`#${activeTeam.teamNumber}`} size="small" />
                  <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {activeTeam.nickname}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {removedTeams.length > 0 && (
        <Stack spacing={0.75}>
          <Typography variant="h6">Removed Teams</Typography>

          {removedTeams.map((team) => (
            <Box
              key={team.teamKey}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1.25,
                py: 0.75,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Chip label={`Rank ${team.originalRank}`} size="small" />
                  <Chip label={`#${team.teamNumber}`} size="small" />
                  <Typography sx={{ fontWeight: 600 }}>
                    {team.nickname}
                  </Typography>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestoreFromTrashIcon />}
                  onClick={() => restoreTeam(team.teamKey)}
                >
                  Restore
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog
        open={Boolean(detailTeam)}
        onClose={() => setDetailTeam(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {detailTeam
            ? `#${detailTeam.teamNumber} ${detailTeam.nickname}`
            : "Team Details"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              Team detail modal placeholder.
            </Typography>

            <Typography color="text.secondary">
              Later, this can show charts, TBA data, scouting summaries, and
              notes for the selected team.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
