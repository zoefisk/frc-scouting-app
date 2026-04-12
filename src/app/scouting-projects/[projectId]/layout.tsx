import React from "react";

import ProjectOfflineAutoCache from "@/components/scouting-projects/ProjectOfflineAutoCache";
import ProjectRouteWarmup from "@/components/scouting-projects/ProjectRouteWarmup";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ScoutingProjectLayout({
  children,
  params,
}: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  return (
    <>
      <ProjectOfflineAutoCache projectId={projectId} />
      {project ? <ProjectRouteWarmup project={project} /> : null}
      {children}
    </>
  );
}
