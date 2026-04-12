import React from "react";
import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import ScoutingProjectSettingsPageContent from "@/components/scouting-projects/pages/ScoutingProjectSettingsPageContent";
import {
  projectHasMatchScoutingData,
  projectHasPitScoutingData,
} from "@/lib/firebase/server/entries";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ScoutingProjectSettingsPage({
  params,
}: PageProps) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const [hasMatchScoutingData, hasPitScoutingData] = await Promise.all([
    projectHasMatchScoutingData(project.id, project.eventKey),
    projectHasPitScoutingData(project.id, project.eventKey),
  ]);

  return (
    <PageShell width="md">
      <ScoutingProjectSettingsPageContent
        project={project}
        hasMatchScoutingData={hasMatchScoutingData}
        hasPitScoutingData={hasPitScoutingData}
      />
    </PageShell>
  );
}
