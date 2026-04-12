"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paper, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

import type { ProjectTeamPerformancePoint } from "@/lib/scouting-projects/analysis/buildProjectTeamAnalysisOverview";

type Props = {
  projectId: string;
  points: ProjectTeamPerformancePoint[];
};

export default function ProjectTeamMatchPerformanceChart({
  projectId,
  points,
}: Props) {
  const router = useRouter();

  const xData = React.useMemo(
    () => points.map((point) => point.matchNumber),
    [points]
  );
  const yData = React.useMemo(
    () => points.map((point) => point.totalScore),
    [points]
  );

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
            Match Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Official alliance score by qualification match. Click a point to
            open that project-scoped match analysis page.
          </Typography>
        </div>

        {points.length === 0 ? (
          <Typography color="text.secondary">
            No qualification matches are available for this team yet.
          </Typography>
        ) : (
          <LineChart
            height={320}
            xAxis={[
              {
                id: "matches",
                scaleType: "point",
                data: xData,
                label: "Match",
                valueFormatter: (value) => `Q${value}`,
              },
            ]}
            yAxis={[
              {
                label: "Score",
                min: 0,
              },
            ]}
            series={[
              {
                id: "team-score",
                label: "Official Score",
                data: yData,
                color: "#1976d2",
                curve: "monotoneX",
                showMark: true,
              },
            ]}
            margin={{ left: 56, right: 20, top: 20, bottom: 40 }}
            grid={{ horizontal: true }}
            onMarkClick={(_, item) => {
              if (typeof item.dataIndex !== "number") {
                return;
              }

              const point = points[item.dataIndex];
              if (!point) {
                return;
              }

              router.push(
                `/scouting-projects/${projectId}/analysis/matches/${point.matchNumber}`
              );
            }}
            sx={{
              "& .MuiMarkElement-root": {
                cursor: "pointer",
              },
            }}
          />
        )}
      </Stack>
    </Paper>
  );
}
