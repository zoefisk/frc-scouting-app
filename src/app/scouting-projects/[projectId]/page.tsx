import PageShell from "@/components/app/layout/PageShell";
import { notFound } from "next/navigation";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import React from "react";
import ScoutingProjectPageContent from "@/components/scouting-projects/pages/ScoutingProjectPageContent";
import { getProjectEventOverview } from "@/lib/scouting-projects/eventOverview";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ScoutingProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);
  if (!project) notFound();
  const eventOverview = await getProjectEventOverview(project.eventKey);

  return (
    <PageShell width="xl">
      <ScoutingProjectPageContent
        project={project}
        eventOverview={eventOverview}
      />
    </PageShell>
  );
}
