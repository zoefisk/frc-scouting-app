import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import NoAccess from "@/components/auth/NoAccess";
import ProjectQuestionnaireBuilderPageContent from "@/components/scouting-projects/pages/ProjectQuestionnaireBuilderPageContent";
import { projectHasPitScoutingData } from "@/lib/firebase/server/entries";
import { getProjectQuestionnaireServer } from "@/lib/firebase/server/questionnaires";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { getBuiltInQuestionnaireById } from "@/lib/scouting/questionnaire/registry";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function PitScoutingBuilderPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const hasPitScoutingData = await projectHasPitScoutingData(
    project.id,
    project.eventKey
  );

  const activeQuestionnaireId = project.activeQuestionnaireIds?.pit;
  const editableQuestionnaire =
    activeQuestionnaireId && !getBuiltInQuestionnaireById(activeQuestionnaireId)
      ? await getProjectQuestionnaireServer(activeQuestionnaireId)
      : null;

  return (
    <PageShell>
      {hasPitScoutingData ? (
        <NoAccess
          title="Pit scouting builder is locked."
          description="This project already has saved pit scouting data, so the pit questionnaire can no longer be edited."
          ctaHref={`/scouting-projects/${project.id}/settings`}
          ctaLabel="Back to Settings"
        />
      ) : (
        <ProjectQuestionnaireBuilderPageContent
          project={project}
          kind="pit"
          activeQuestionnaireId={activeQuestionnaireId}
          editableQuestionnaire={editableQuestionnaire}
        />
      )}
    </PageShell>
  );
}
