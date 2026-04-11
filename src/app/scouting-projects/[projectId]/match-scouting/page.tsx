import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import MatchScoutingPageContent from "@/components/scouting/pages/MatchScoutingPageContent";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectMatchScoutingPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const questionnaire = await resolveProjectQuestionnaireServer(
    project.activeQuestionnaireIds?.match
  );

  if (!questionnaire) {
    notFound();
  }

  return (
    <PageShell>
      <ProjectAccessGuard project={project}>
        <MatchScoutingPageContent
          projectId={project.id}
          questionnaire={questionnaire}
          defaultEventKey={project.eventKey}
          title={`${project.name} Match Scouting`}
          description="Match scouting entries saved from this page stay associated with this scouting project."
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
