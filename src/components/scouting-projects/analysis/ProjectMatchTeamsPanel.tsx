"use client";

import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import type { ProjectMatchAnalysisTeam } from "@/lib/scouting-projects/analysis/buildProjectMatchAnalysisOverview";

type Props = {
  projectId: string;
  redTeams: ProjectMatchAnalysisTeam[];
  blueTeams: ProjectMatchAnalysisTeam[];
  redScore: number | null;
  blueScore: number | null;
};

function AllianceCard({
  title,
  color,
  teams,
  score,
  projectId,
}: {
  title: string;
  color: "red" | "blue";
  teams: ProjectMatchAnalysisTeam[];
  score: number | null;
  projectId: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        height: "100%",
        borderColor:
          color === "red" ? "rgba(220,38,38,0.25)" : "rgba(37,99,235,0.25)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {score !== null && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: color === "red" ? "error.main" : "primary.main",
              }}
            >
              {score} pts
            </Typography>
          )}
        </Stack>

        <Stack spacing={0.625}>
          {teams.map((team) => (
            <Box
              key={team.teamKey}
              sx={{
                px: 1,
                py: 0.625,
                borderRadius: 1.5,
                border: 1,
                borderColor:
                  color === "red"
                    ? "rgba(220,38,38,0.15)"
                    : "rgba(37,99,235,0.15)",
                backgroundColor:
                  color === "red"
                    ? "rgba(220,38,38,0.03)"
                    : "rgba(37,99,235,0.03)",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  component={Link}
                  href={`/scouting-projects/${projectId}/analysis/teams/${team.teamKey}`}
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  #{team.teamNumber}{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    {team.teamName}
                  </Typography>
                </Typography>

                <Chip
                  label={team.rank != null ? `#${team.rank}` : "—"}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.68rem", height: 20, minWidth: 32 }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ProjectMatchTeamsPanel({
  projectId,
  redTeams,
  blueTeams,
  redScore,
  blueScore,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "minmax(0, 1fr) minmax(0, 1fr)",
        },
        gap: 1,
      }}
    >
      <AllianceCard
        title="Red Alliance"
        color="red"
        teams={redTeams}
        score={redScore}
        projectId={projectId}
      />
      <AllianceCard
        title="Blue Alliance"
        color="blue"
        teams={blueTeams}
        score={blueScore}
        projectId={projectId}
      />
    </Box>
  );
}
