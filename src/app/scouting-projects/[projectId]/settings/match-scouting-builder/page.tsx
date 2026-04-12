import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import NoAccess from "@/components/auth/NoAccess";
import ProjectQuestionnaireBuilderPageContent from "@/components/scouting-projects/pages/ProjectQuestionnaireBuilderPageContent";
import { projectHasMatchScoutingData } from "@/lib/firebase/server/entries";
import { getProjectQuestionnaireServer } from "@/lib/firebase/server/questionnaires";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { getBuiltInQuestionnaireById } from "@/lib/scouting/questionnaire/registry";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function MatchScoutingBuilderPage({ params }: Props) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const hasMatchScoutingData = await projectHasMatchScoutingData(
    project.id,
    project.eventKey
  );

  const activeQuestionnaireId = project.activeQuestionnaireIds?.match;
  const editableQuestionnaire =
    activeQuestionnaireId && !getBuiltInQuestionnaireById(activeQuestionnaireId)
      ? await getProjectQuestionnaireServer(activeQuestionnaireId)
      : null;

  return (
    <PageShell>
      {hasMatchScoutingData ? (
        <NoAccess
          title="Match scouting builder is locked."
          description="This project already has saved match scouting data, so the match questionnaire can no longer be edited."
          ctaHref={`/scouting-projects/${project.id}/settings`}
          ctaLabel="Back to Settings"
        />
      ) : (
        <ProjectQuestionnaireBuilderPageContent
          project={project}
          kind="match"
          activeQuestionnaireId={activeQuestionnaireId}
          editableQuestionnaire={editableQuestionnaire}
        />
      )}
    </PageShell>
  );
}
