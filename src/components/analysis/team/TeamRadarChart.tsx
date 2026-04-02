"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { TeamRadarSummary } from "@/lib/analysis/team/buildTeamRadarMetrics";

export type TeamRadarSeries = {
  label: string;
  summary: TeamRadarSummary;
};

type Props = {
  series?: TeamRadarSeries[];
};

export default function TeamRadarChart({ series = [] }: Props) {
  const firstSummary = series[0]?.summary;

  if (!firstSummary || firstSummary.sampleSize === 0) {
    return (
      <Typography color="text.secondary">
        No present-match scouting data available for this team yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <RadarChart
        height={420}
        series={series.map((item) => ({
          label: item.label,
          data: item.summary.metrics.map((metric) => metric.value),
          fillArea: true,
        }))}
        radar={{
          metrics: firstSummary.metrics.map((metric) => ({
            name: metric.label,
            min: 0,
            max: 5,
          })),
        }}
        highlight="series"
        slotProps={{
          tooltip: {
            trigger: "item",
          },
        }}
      />
    </Box>
  );
}
