import { notFound } from "next/navigation";
import { Alert, Chip, Grid, Stack, Typography } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ProjectQualificationResultsGrid from "@/components/scouting-projects/analysis/ProjectQualificationResultsGrid";
import ProjectRankingsGrid from "@/components/scouting-projects/analysis/ProjectRankingsGrid";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { buildProjectAnalysisOverview } from "@/lib/scouting-projects/analysis/buildProjectAnalysisOverview";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectAnalysisPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const { qualificationRows, rankingRows } = await buildProjectAnalysisOverview(
    project.eventKey
  );

  return (
    <PageShell width="xl">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {project.name} Analysis
          </Typography>

          <Typography color="text.secondary">
            Analysis views opened from here are associated with this scouting
            project and its event.
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={project.eventKey} />
            <Chip label={`${qualificationRows.length} qualification matches`} />
          </Stack>

          {qualificationRows.length === 0 ? (
            <Alert severity="info">
              No qualification matches were returned from TBA for this event.
            </Alert>
          ) : (
            <Grid container spacing={3} alignItems="start">
              <Grid size={{ xs: 12, xl: 7 }}>
                <ProjectQualificationResultsGrid
                  projectId={project.id}
                  eventKey={project.eventKey}
                  rows={qualificationRows}
                />
              </Grid>
              <Grid size={{ xs: 12, xl: 5 }}>
                <ProjectRankingsGrid
                  projectId={project.id}
                  rows={rankingRows}
                />
              </Grid>
            </Grid>
          )}
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
