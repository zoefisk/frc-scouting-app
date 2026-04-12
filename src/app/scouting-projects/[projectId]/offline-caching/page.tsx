import React from "react";
import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ProjectOfflineCachingPageContent from "@/components/scouting-projects/pages/ProjectOfflineCachingPageContent";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectOfflineCachingPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  return (
    <PageShell width="md">
      <ProjectAccessGuard project={project}>
        <ProjectOfflineCachingPageContent project={project} />
      </ProjectAccessGuard>
    </PageShell>
  );
}
