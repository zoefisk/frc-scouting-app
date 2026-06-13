import { notFound } from "next/navigation";

import PageShell from "@/components/app/layout/PageShell";
import MatchScoutingPageContent from "@/components/scouting/pages/MatchScoutingPageContent";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import {
  getProjectQuestionnaireId,
  projectHasConfiguredQuestionnaire,
  projectSupportsQuestionnaireKind,
} from "@/lib/scouting-projects/questionnaires/availability";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";
import { Stack } from "@mui/material";

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

  if (!projectSupportsQuestionnaireKind(project, "match")) {
    notFound();
  }

  if (!projectHasConfiguredQuestionnaire(project, "match")) {
    notFound();
  }

  const questionnaireId = getProjectQuestionnaireId(project, "match");

  if (!questionnaireId) {
    notFound();
  }

  const questionnaire =
    await resolveProjectQuestionnaireServer(questionnaireId);

  if (!questionnaire) {
    notFound();
  }

  return (
    <PageShell>
      <ProjectAccessGuard project={project}>
        <Stack spacing={2}>
          <ScoutingProjectBreadcrumbs
            items={[
              { label: "Scouting Projects", href: "/scouting-projects" },
              { label: project.name, href: `/scouting-projects/${project.id}` },
              { label: "Match Scouting" },
            ]}
          />
          <MatchScoutingPageContent
            projectId={project.id}
            questionnaire={questionnaire}
            defaultEventKey={project.eventKey}
            defaultMatchNumber={resolvedSearchParams?.match}
            matchCollectionMode={project.matchCollectionMode ?? "robot"}
            lockEvent
            enableDraftHydration={false}
            defaultScoutingPosition={
              resolvedSearchParams?.position === "blueAlliance" ||
              resolvedSearchParams?.position === "blue1" ||
              resolvedSearchParams?.position === "blue2" ||
              resolvedSearchParams?.position === "blue3" ||
              resolvedSearchParams?.position === "redAlliance" ||
              resolvedSearchParams?.position === "red1" ||
              resolvedSearchParams?.position === "red2" ||
              resolvedSearchParams?.position === "red3"
                ? resolvedSearchParams.position
                : undefined
            }
            title={`${project.name} Match Scouting`}
            description="Match scouting entries saved from this page stay associated with this scouting project."
          />
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
