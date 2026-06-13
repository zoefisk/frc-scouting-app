import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import type { ProjectListItem } from "./types";

function sourceLabel(source: ProjectListItem["source"]) {
  if (source === "owned") return "OWNER";
  if (source === "joined") return "JOINED";
  return "DEVICE";
}

function getProjectStatusChipStyles(status: ProjectListItem["status"]) {
  if (status === "inactive") {
    return {
      backgroundColor: "rgba(148,163,184,0.14)",
      color: "#475569",
      fontWeight: 700,
    };
  }

  return {
    backgroundColor: "rgba(34,197,94,0.12)",
    color: "#166534",
    fontWeight: 700,
  };
}

export default function ProjectCard({
  project,
  onTogglePinned,
  onArchive,
  onRestore,
}: {
  project: ProjectListItem;
  onTogglePinned: (projectId: string, pinned: boolean) => Promise<void>;
  onArchive: (project: ProjectListItem) => void;
  onRestore: (project: ProjectListItem) => void;
}) {
  const isArchived = project.isGloballyArchived || project.isLocallyArchived;
  const canRestore = project.isGloballyArchived
    ? project.memberRole === "owner"
    : project.isLocallyArchived;
  const archiveLabel = project.isGloballyArchived
    ? "ARCHIVED"
    : project.isLocallyArchived
      ? "HIDDEN"
      : null;

  return (
    <Box
      sx={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 4,
        p: 3,
        backgroundColor: isArchived ? "rgba(248,250,252,0.9)" : "white",
        opacity: isArchived ? 0.82 : 1,
        filter: isArchived ? "grayscale(0.28)" : "none",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="flex-start"
          useFlexGap
          flexWrap="wrap"
        >
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {project.name}
            </Typography>

            <Typography color="text.secondary">
              {project.eventKey} ({project.year})
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            {project.pinned ? (
              <Chip
                label="PINNED"
                size="small"
                sx={{
                  backgroundColor: "rgba(37,99,235,0.12)",
                  color: "#1d4ed8",
                  fontWeight: 700,
                }}
              />
            ) : null}
            {archiveLabel ? (
              <Chip
                label={archiveLabel}
                size="small"
                sx={{
                  backgroundColor: "rgba(148,163,184,0.16)",
                  color: "#475569",
                  fontWeight: 700,
                }}
              />
            ) : null}
            <Chip
              label={sourceLabel(project.source)}
              size="small"
              sx={{
                backgroundColor: "rgba(15,23,42,0.06)",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={`Status: ${project.status}`}
            size="small"
            sx={getProjectStatusChipStyles(project.status)}
          />
          <Chip
            label={`Data: ${project.dataMode}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Access: ${project.accessMode}`}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link href={`/scouting-projects/${project.id}`} prefetch={false}>
              <Button variant="text" sx={{ px: 0 }}>
                Open Project
              </Button>
            </Link>

            {canRestore ? (
              <Button
                variant="text"
                size="small"
                startIcon={<UnarchiveOutlinedIcon fontSize="small" />}
                onClick={() => onRestore(project)}
              >
                Restore
              </Button>
            ) : !isArchived ? (
              <Button
                variant="text"
                size="small"
                startIcon={<ArchiveOutlinedIcon fontSize="small" />}
                onClick={() => onArchive(project)}
              >
                Archive
              </Button>
            ) : null}
          </Stack>

          {!isArchived ? (
            <IconButton
              aria-label={project.pinned ? "Unpin project" : "Pin project"}
              onClick={() => void onTogglePinned(project.id, project.pinned)}
              sx={{
                color: project.pinned ? "#1d4ed8" : "text.secondary",
              }}
            >
              <PushPinOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
