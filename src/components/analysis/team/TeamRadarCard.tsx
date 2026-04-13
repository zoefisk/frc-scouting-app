"use client";

import React from "react";
import { Alert, Box, Divider, Paper, Stack, Typography } from "@mui/material";
import TeamRadarChart, {
  TeamRadarSeries,
} from "@/components/analysis/team/TeamRadarChart";

type Props = {
  sampleSize: number;
  series: TeamRadarSeries[];
  picker?: React.ReactNode;
  loading?: boolean;
  error?: string;
};

function computeOverallAverage(series: TeamRadarSeries): number {
  const metrics = series.summary.metrics;
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, m) => acc + m.value, 0);
  return sum / metrics.length;
}

export default function TeamRadarCard({
  sampleSize,
  series,
  picker,
  loading = false,
  error = "",
}: Props) {
  const hasData = series.length > 0 && (series[0]?.summary.sampleSize ?? 0) > 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Team Radar
        </Typography>

        <Typography color="text.secondary">
          Based on {sampleSize} present scouted match
          {sampleSize === 1 ? "" : "es"}.
        </Typography>

        {picker}

        {loading && (
          <Typography color="text.secondary">
            Loading comparison team...
          </Typography>
        )}

        {error && <Alert severity="warning">{error}</Alert>}

        <TeamRadarChart series={series} />

        {hasData && (
          <>
            <Divider />
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Overall Performance
              </Typography>
              <Stack direction="row" spacing={3}>
                {series.map((s) => (
                  <Box key={s.label}>
                    {series.length > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        {s.label}
                      </Typography>
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {computeOverallAverage(s).toFixed(2)}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        / 5
                      </Typography>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}
