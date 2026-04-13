"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

import { type MarkElementProps } from "@mui/x-charts/LineChart";

import type { ProjectTeamPerformancePoint } from "@/lib/scouting-projects/analysis/buildProjectTeamAnalysisOverview";

type Props = {
  projectId: string;
  points: ProjectTeamPerformancePoint[];
};

function getResultColor(result: "W" | "L" | "T"): string {
  if (result === "W") return "#16a34a";
  if (result === "L") return "#dc2626";
  return "#9ca3af";
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

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

  const ResultMark = React.useMemo(
    () =>
      function CustomMark({ x, y, dataIndex, isFaded }: MarkElementProps) {
        const cx = Number(x);
        const cy = Number(y);
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
        const point = points[dataIndex];
        const color = point ? getResultColor(point.result) : "#1976d2";
        return (
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill={color}
            stroke="white"
            strokeWidth={2}
            opacity={isFaded ? 0.3 : 1}
            style={{ cursor: "pointer" }}
          />
        );
      },
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
          <>
            <LineChart
              height={300}
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
              slots={{ mark: ResultMark }}
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

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ pb: 0.5 }}
            >
              <LegendDot color="#16a34a" label="Win" />
              <LegendDot color="#dc2626" label="Loss" />
              <LegendDot color="#9ca3af" label="Tie" />
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
