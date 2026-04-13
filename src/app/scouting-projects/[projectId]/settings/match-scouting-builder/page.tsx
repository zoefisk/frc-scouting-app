import { notFound } from "next/navigation";
import { Stack } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import NoAccess from "@/components/auth/NoAccess";
import ProjectQuestionnaireBuilderPageContent from "@/components/scouting-projects/pages/ProjectQuestionnaireBuilderPageContent";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
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
    <PageShell width={"xl"}>
      <Stack spacing={2}>
        <ScoutingProjectBreadcrumbs
          items={[
            { label: "Scouting Projects", href: "/scouting-projects" },
            { label: project.name, href: `/scouting-projects/${project.id}` },
            {
              label: "Settings",
              href: `/scouting-projects/${project.id}/settings`,
            },
            { label: "Match Scouting Builder" },
          ]}
        />
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
      </Stack>
    </PageShell>
  );
}
