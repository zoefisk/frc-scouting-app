import React from "react";
import { Chip, Stack, Typography } from "@mui/material";
import ScoutingSchedule from "@/components/scouting-projects/dashboard/ScoutingSchedule";
import type { ScoutingProjectDoc } from "@/lib/scouting-projects/types";
import type { ProjectEventOverview } from "@/lib/scouting-projects/eventOverview";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  eventOverview: ProjectEventOverview | null;
};

function getStatusChipStyles(tone: ProjectEventOverview["statusTone"]) {
  if (tone === "success") {
    return {
      backgroundColor: "rgba(34,197,94,0.12)",
      color: "#166534",
      border: "1px solid rgba(34,197,94,0.18)",
    };
  }

  if (tone === "active") {
    return {
      backgroundColor: "rgba(59,130,246,0.12)",
      color: "#1d4ed8",
      border: "1px solid rgba(59,130,246,0.18)",
    };
  }

  return {
    backgroundColor: "rgba(15,23,42,0.06)",
    color: "#334155",
    border: "1px solid rgba(15,23,42,0.12)",
  };
}

export default function ScoutingProjectPageContent({
  project,
  eventOverview,
}: Props) {
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {project.name}
        </Typography>

        {eventOverview && (
          <Chip
            label={eventOverview.statusLabel}
            sx={{
              height: 40,
              px: 1,
              fontSize: "0.95rem",
              fontWeight: 700,
              ...getStatusChipStyles(eventOverview.statusTone),
            }}
          />
        )}
      </Stack>

      <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label="EVENT"
            size="small"
            sx={{
              backgroundColor: "grey.300",
              color: "grey.900",
              fontWeight: 600,
              minWidth: 70,
            }}
          />
          <Typography>
            {project.eventKey} ({project.year})
          </Typography>
        </Stack>

        {eventOverview?.eventDateLabel && (
          <Typography color="text.secondary">
            Event dates: {eventOverview.eventDateLabel}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label="PARTICIPATING TEAMS"
            size="small"
            sx={{
              backgroundColor: "grey.300",
              color: "grey.900",
              fontWeight: 600,
              minWidth: 70,
            }}
          />
          <Typography>{project.teamKeys.join(", ")}</Typography>
        </Stack>

        <Typography color="text.secondary">
          Access mode: {project.accessMode}
        </Typography>

        <Typography color="text.secondary">
          Data mode: {project.dataMode}
        </Typography>
      </Stack>

      <ScoutingSchedule project={project} />
    </Stack>
  );
}
