import React from "react";
import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import ScoutingProjectSettingsPageContent from "@/components/scouting-projects/pages/ScoutingProjectSettingsPageContent";
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

  return (
    <PageShell width="md">
      <ScoutingProjectSettingsPageContent project={project} />
    </PageShell>
  );
}
