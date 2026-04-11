import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import AlliancePicker from "@/components/alliance/AlliancePicker";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

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
        <AlliancePicker
          myTeamNumber={3461}
          defaultYear={project.year}
          defaultEventKey={project.eventKey}
          lockProjectEvent
          title={`${project.name} Alliance Selector`}
          description="Alliance selection is locked to this scouting project's event."
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
