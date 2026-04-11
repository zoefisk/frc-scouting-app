import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Button, Stack, Typography } from "@mui/material";

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
    <PageShell width="md">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {project.name} Analysis
          </Typography>

          <Typography color="text.secondary">
            Analysis views opened from here are associated with this scouting
            project and its event.
          </Typography>

          <Alert severity="info">
            Project-aware analysis routing is in place. The detailed reporting
            pipeline still needs to switch from event-only queries to
            project-filtered queries using the saved `projectId` on responses.
          </Alert>

          <Link
            href={`/analysis/${project.eventKey}/teams`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained">Open Event Team Analysis</Button>
          </Link>
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
