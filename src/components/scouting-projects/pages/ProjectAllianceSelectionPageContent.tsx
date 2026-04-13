"use client";

import AlliancePicker from "@/components/alliance/AlliancePicker";
import { useAuth } from "@/components/app/providers/AuthProvider";
import {
  canEditProjectAllianceSelector,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: ScoutingProjectDoc & { id: string };
};

export default function ProjectAllianceSelectionPageContent({
  project,
}: Props) {
  const { user } = useAuth();

  return (
    <AlliancePicker
      myTeamNumber={3461}
      defaultYear={project.year}
      defaultEventKey={project.eventKey}
      lockProjectEvent
      projectId={project.id}
      canEdit={canEditProjectAllianceSelector(project, user?.uid)}
      title={`${project.name} Alliance Selector`}
      description="Alliance selection is locked to this scouting project's event."
    />
  );
}
