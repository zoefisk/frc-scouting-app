import { notFound } from "next/navigation";
import { Alert, Stack, Typography } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    projectId: string;
    teamKey: string;
  }>;
};

export default async function ProjectTeamAnalysisPage({ params }: Props) {
  const { projectId, teamKey } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  return (
    <PageShell width="md">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Team Analysis
          </Typography>

          <Typography color="text.secondary">
            Team-level analysis for {teamKey} in {project.name} will live here.
          </Typography>

          <Alert severity="info">
            This route is reserved for project-scoped team summaries and match
            history once the deeper analysis pipeline is ready.
          </Alert>
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
