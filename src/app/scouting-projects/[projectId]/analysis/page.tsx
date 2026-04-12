import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Button, Chip, Stack, Typography } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
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

  return (
    <PageShell width="lg">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {project.name} Analysis
          </Typography>

          <Typography color="text.secondary">
            Analysis views opened from here are associated with this scouting
            project and its event.
          </Typography>

          <Chip label={project.eventKey} />
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
