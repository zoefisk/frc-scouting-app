import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
import ProjectAllianceSelectionPageContent from "@/components/scouting-projects/pages/ProjectAllianceSelectionPageContent";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { Stack } from "@mui/material";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectAllianceSelectionPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  return (
    <PageShell>
      <ProjectAccessGuard project={project}>
        <Stack spacing={2}>
          <ScoutingProjectBreadcrumbs
            items={[
              { label: "Scouting Projects", href: "/scouting-projects" },
              { label: project.name, href: `/scouting-projects/${project.id}` },
              { label: "Alliance Selector" },
            ]}
          />
          <ProjectAllianceSelectionPageContent project={project} />
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
