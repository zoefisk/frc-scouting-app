import Link from "next/link";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { ProjectListItem } from "./types";

function sourceLabel(source: ProjectListItem["source"]) {
  if (source === "owned") return "OWNER";
  if (source === "joined") return "JOINED";
  return "DEVICE";
}

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 4,
        p: 3,
        backgroundColor: "white",
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

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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

        <Box>
          <Link href={`/scouting-projects/${project.id}`}>
            <Button variant="text" sx={{ px: 0 }}>
              Open Project
            </Button>
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}
