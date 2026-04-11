"use client";

import { Stack, Typography } from "@mui/material";
import ProjectsEmptyState from "@/components/scouting-projects/pages/index/ProjectsEmptyState";
import ProjectsGrid from "@/components/scouting-projects/pages/index/ProjectsGrid";
import ProjectsHeader from "@/components/scouting-projects/pages/index/ProjectsHeader";
import { useScoutingProjects } from "@/components/scouting-projects/pages/index/useScoutingProjects";

export default function ScoutingProjectsIndexPage() {
  const { projects, error, isLoading } = useScoutingProjects();

  return (
    <Stack spacing={3}>
      <ProjectsHeader />

      {isLoading ? (
        <Typography color="text.secondary">
          Loading scouting projects...
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : projects.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <ProjectsGrid projects={projects} />
      )}
    </Stack>
  );
}
