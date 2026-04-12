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
  searchParams?: Promise<{
    match?: string;
    position?: string;
  }>;
};

export default async function ProjectMatchScoutingPage({
  params,
  searchParams,
}: Props) {
  const { projectId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
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
          defaultMatchNumber={resolvedSearchParams?.match}
          lockEvent
          defaultScoutingPosition={
            resolvedSearchParams?.position === "blue1" ||
            resolvedSearchParams?.position === "blue2" ||
            resolvedSearchParams?.position === "blue3" ||
            resolvedSearchParams?.position === "red1" ||
            resolvedSearchParams?.position === "red2" ||
            resolvedSearchParams?.position === "red3"
              ? resolvedSearchParams.position
              : undefined
          }
          title={`${project.name} Match Scouting`}
          description="Match scouting entries saved from this page stay associated with this scouting project."
        />
      </ProjectAccessGuard>
    </PageShell>
  );
}
