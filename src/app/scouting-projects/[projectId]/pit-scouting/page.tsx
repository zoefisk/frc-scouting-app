import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import NoAccess from "@/components/auth/NoAccess";
import PitScoutingForm from "@/components/scouting/PitScoutingForm";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import {
  getMissingProjectQuestionnaireMessage,
  projectHasConfiguredQuestionnaire,
} from "@/lib/scouting-projects/questionnaires/availability";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    team?: string;
  }>;
};

export default async function ProjectPitScoutingPage({
  params,
  searchParams,
}: Props) {
  const { projectId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  if (!projectHasConfiguredQuestionnaire(project, "pit")) {
    return (
      <PageShell width="md">
        <ProjectAccessGuard project={project}>
          <NoAccess
            title="Pit scouting is not ready yet."
            description="This project uses a custom form, but its pit scouting questionnaire has not been created yet."
            note={getMissingProjectQuestionnaireMessage("pit")}
          />
        </ProjectAccessGuard>
      </PageShell>
    );
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
          defaultTeamKey={resolvedSearchParams?.team}
          title={`${project.name} Pit Scouting`}
          description="Pit scouting entries saved from this page stay associated with this scouting project."
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
