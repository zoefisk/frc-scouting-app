import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import ScanImportPageContent from "@/components/scan/ScanImportPageContent";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectImportPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  return (
    <PageShell width="lg">
      <ProjectAccessGuard project={project}>
        <ScanImportPageContent
          defaultProjectId={project.id}
          projectName={project.name}
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
