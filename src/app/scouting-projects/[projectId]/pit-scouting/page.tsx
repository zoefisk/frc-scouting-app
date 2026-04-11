import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import PitScoutingForm from "@/components/scouting/PitScoutingForm";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPitScoutingPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const questionnaire = await resolveProjectQuestionnaireServer(
    project.activeQuestionnaireIds?.pit
  );

  if (!questionnaire) {
    notFound();
  }

  return (
    <PageShell>
      <ProjectAccessGuard project={project}>
        <PitScoutingForm
          projectId={project.id}
          questionnaire={questionnaire}
          defaultEventKey={project.eventKey}
          title={`${project.name} Pit Scouting`}
          description="Pit scouting entries saved from this page stay associated with this scouting project."
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
