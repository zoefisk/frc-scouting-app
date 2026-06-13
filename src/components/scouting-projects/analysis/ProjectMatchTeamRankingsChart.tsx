"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { Paper, Stack, Typography } from "@mui/material";

import type { ProjectMatchAnalysisTeam } from "@/lib/scouting-projects/analysis/buildProjectMatchAnalysisOverview";

type Props = {
  redTeams: ProjectMatchAnalysisTeam[];
  blueTeams: ProjectMatchAnalysisTeam[];
  teamCount: number;
};

export default function ProjectMatchTeamRankingsChart({
  redTeams,
  blueTeams,
  teamCount,
}: Props) {
  const orderedTeams = [...redTeams, ...blueTeams];
  const hasRankData = orderedTeams.some((t) => t.rank !== null);

  if (!hasRankData) return null;

  // Invert rank so rank 1 = tallest bar (most prominent = best team)
  const rankingStrength = (rank: number | null) =>
    rank !== null ? Math.max(1, teamCount - rank + 1) : 0;

  const labels = orderedTeams.map((t) => `#${t.teamNumber}`);
  const redValues = orderedTeams.map((team) =>
    team.allianceColor === "red" ? rankingStrength(team.rank) : null
  );
  const blueValues = orderedTeams.map((team) =>
    team.allianceColor === "blue" ? rankingStrength(team.rank) : null
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Alliance Strength
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Current event ranking by team — taller bar = better rank.
        </Typography>
        <BarChart
          xAxis={[
            {
              data: labels,
              scaleType: "band",
              tickLabelStyle: { fontSize: 11 },
            },
          ]}
          yAxis={[
            {
              label: "Ranking strength",
              tickLabelStyle: { fontSize: 10 },
            },
          ]}
          series={[
            {
              data: redValues,
              label: "Red alliance",
              color: "#dc2626",
            },
            {
              data: blueValues,
              label: "Blue alliance",
              color: "#2563eb",
            },
          ]}
          height={210}
          margin={{ top: 8, bottom: 36, left: 52, right: 8 }}
          hideLegend
        />
      </Stack>
    </Paper>
  );
}
