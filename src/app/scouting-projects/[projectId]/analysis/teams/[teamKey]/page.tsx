import { notFound } from "next/navigation";
import { Alert, AlertTitle, Stack } from "@mui/material";

import PageShell from "@/components/app/layout/PageShell";
import ProjectTeamInfoCards from "@/components/scouting-projects/analysis/ProjectTeamInfoCards";
import ProjectTeamMatchPerformanceChart from "@/components/scouting-projects/analysis/ProjectTeamMatchPerformanceChart";
import ProjectTeamRadarPanel from "@/components/scouting-projects/analysis/ProjectTeamRadarPanel";
import ProjectTeamRawDataAccordion from "@/components/scouting-projects/analysis/ProjectTeamRawDataAccordion";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { buildProjectTeamAnalysisOverview } from "@/lib/scouting-projects/analysis/buildProjectTeamAnalysisOverview";

type Props = {
  params: Promise<{
    projectId: string;
    teamKey: string;
  }>;
};

export default async function ProjectTeamAnalysisPage({ params }: Props) {
  const { projectId, teamKey } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const overview = await buildProjectTeamAnalysisOverview(project, teamKey);

  return (
    <PageShell width="xl">
      <ProjectAccessGuard project={project}>
        <Stack spacing={2.25}>
          <ScoutingProjectBreadcrumbs
            items={[
              { label: "Scouting Projects", href: "/scouting-projects" },
              { label: project.name, href: `/scouting-projects/${project.id}` },
              {
                label: "Analysis",
                href: `/scouting-projects/${project.id}/analysis`,
              },
              { label: `Team ${overview.teamDisplayName}` },
            ]}
          />

          <ProjectTeamInfoCards
            teamDisplayName={overview.teamDisplayName}
            teamLongName={overview.teamLongName}
            eventName={overview.eventName}
            generalInfo={overview.generalInfo}
            eventInfo={overview.eventInfo}
          />

          {(overview.missingScouting.missingMatchNumbers.length > 0 ||
            overview.missingScouting.missingPit) && (
            <Alert severity="warning">
              <AlertTitle>Missing Scouting Data</AlertTitle>
              {overview.missingScouting.missingMatchNumbers.length > 0 && (
                <div>
                  No match scouting entry for:{" "}
                  {overview.missingScouting.missingMatchNumbers
                    .map((n) => `Q${n}`)
                    .join(", ")}
                </div>
              )}
              {overview.missingScouting.missingPit && (
                <div>
                  No pit scouting entry has been submitted for this team.
                </div>
              )}
            </Alert>
          )}

          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={1.5}
            alignItems="stretch"
          >
            <Stack flex={1.1} minWidth={0}>
              <ProjectTeamRadarPanel
                series={overview.radarSeries}
                sampleSize={overview.radarSampleSize}
              />
            </Stack>
            <Stack flex={1.4} minWidth={0}>
              <ProjectTeamMatchPerformanceChart
                projectId={project.id}
                points={overview.performancePoints}
              />
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            {overview.matchRawTable ? (
              <ProjectTeamRawDataAccordion
                table={overview.matchRawTable}
                defaultExpanded
              />
            ) : null}

            {overview.pitRawTable ? (
              <ProjectTeamRawDataAccordion table={overview.pitRawTable} />
            ) : null}
          </Stack>
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
