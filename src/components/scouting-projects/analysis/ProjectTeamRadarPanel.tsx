"use client";

import { Paper, Stack, Typography } from "@mui/material";

import TeamRadarChart, {
  type TeamRadarSeries,
} from "@/components/analysis/team/TeamRadarChart";
import type { ProjectTeamRadarSeries } from "@/lib/scouting-projects/analysis/buildProjectTeamAnalysisOverview";

type Props = {
  series: ProjectTeamRadarSeries[];
  sampleSize: number;
};

export default function ProjectTeamRadarPanel({ series, sampleSize }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 2.5,
        height: "100%",
      }}
    >
      <Stack spacing={1.5}>
        <div>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: -0.2 }}
          >
            Strengths & Weaknesses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placeholder radar profile for now, structured so we can swap in real
            project-derived metrics next.
          </Typography>
        </div>

        <Typography variant="body2" color="text.secondary">
          Using {sampleSize} sample{sampleSize === 1 ? "" : "s"} in the current
          preview model.
        </Typography>

        <TeamRadarChart series={series as TeamRadarSeries[]} />
      </Stack>
    </Paper>
  );
}
