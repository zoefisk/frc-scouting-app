import React from "react";
import { notFound } from "next/navigation";
import { Stack } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
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
      <Stack spacing={2}>
        <ScoutingProjectBreadcrumbs
          items={[
            { label: "Scouting Projects", href: "/scouting-projects" },
            { label: project.name, href: `/scouting-projects/${project.id}` },
            { label: "Settings" },
          ]}
        />
        <ScoutingProjectSettingsPageContent
          project={project}
          hasMatchScoutingData={hasMatchScoutingData}
          hasPitScoutingData={hasPitScoutingData}
        />
      </Stack>
    </PageShell>
  );
}

// todo : import and export JSON data for creating questionnaires
