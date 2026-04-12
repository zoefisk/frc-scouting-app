import { notFound } from "next/navigation";
import { Stack, Typography } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    projectId: string;
    matchNumber: string;
  }>;
};

export default async function ProjectMatchAnalysisPage({ params }: Props) {
  const { projectId, matchNumber } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  return (
    <PageShell width="md">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2}>
          <ScoutingProjectBreadcrumbs
            items={[
              { label: "Scouting Projects", href: "/scouting-projects" },
              { label: project.name, href: `/scouting-projects/${project.id}` },
              {
                label: "Analysis",
                href: `/scouting-projects/${project.id}/analysis`,
              },
              { label: `Match ${matchNumber}` },
            ]}
          />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Match {matchNumber} Analysis
          </Typography>

          <Typography color="text.secondary">
            Match-level analysis for {project.name} will live here.
          </Typography>
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
