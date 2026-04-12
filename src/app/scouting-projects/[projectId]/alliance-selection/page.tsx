import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import AlliancePicker from "@/components/alliance/AlliancePicker";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
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
          <AlliancePicker
            myTeamNumber={3461}
            defaultYear={project.year}
            defaultEventKey={project.eventKey}
            lockProjectEvent
            title={`${project.name} Alliance Selector`}
            description="Alliance selection is locked to this scouting project's event."
          />
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
