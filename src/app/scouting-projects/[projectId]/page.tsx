import PageShell from "@/components/app/layout/PageShell";
import { notFound } from "next/navigation";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import React from "react";
import ScoutingProjectPageContent from "@/components/scouting-projects/pages/ScoutingProjectPageContent";
import { getProjectEventOverview } from "@/lib/scouting-projects/eventOverview";
import { Stack } from "@mui/material";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";

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
      <Stack spacing={2}>
        <ScoutingProjectBreadcrumbs
          items={[
            { label: "Scouting Projects", href: "/scouting-projects" },
            { label: project.name },
          ]}
        />
        <ScoutingProjectPageContent
          project={project}
          eventOverview={eventOverview}
        />
      </Stack>
    </PageShell>
  );
}
