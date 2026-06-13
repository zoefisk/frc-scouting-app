import { notFound } from "next/navigation";
import { Alert, AlertTitle, Box, Chip, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import PageShell from "@/components/app/layout/PageShell";
import ProjectMatchInfoCards from "@/components/scouting-projects/analysis/ProjectMatchInfoCards";
import ProjectMatchTeamRankingsChart from "@/components/scouting-projects/analysis/ProjectMatchTeamRankingsChart";
import ProjectMatchTeamsPanel from "@/components/scouting-projects/analysis/ProjectMatchTeamsPanel";
import ProjectTeamRawDataAccordion from "@/components/scouting-projects/analysis/ProjectTeamRawDataAccordion";
import ProjectAccessGuard from "@/components/scouting-projects/ProjectAccessGuard";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { buildProjectMatchAnalysisOverview } from "@/lib/scouting-projects/analysis/buildProjectMatchAnalysisOverview";
import { hasMatchData } from "@/lib/scouting-projects/types";

type Props = {
  params: Promise<{
    projectId: string;
    matchNumber: string;
  }>;
};

export default async function ProjectMatchAnalysisPage({ params }: Props) {
  const { projectId, matchNumber } = await params;
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    notFound();
  }

  const parsedMatchNumber = Number(matchNumber);

  if (!Number.isFinite(parsedMatchNumber)) {
    notFound();
  }

  const overview = await buildProjectMatchAnalysisOverview(
    project,
    parsedMatchNumber
  );

  if (!overview) {
    notFound();
  }

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
              { label: `Match ${overview.matchNumber}` },
            ]}
          />

          <ProjectMatchInfoCards
            title={overview.title}
            subtitle={overview.subtitle}
            generalInfo={overview.generalInfo}
            eventInfo={overview.eventInfo}
            youtubeUrl={overview.youtubeUrl}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) minmax(0, 340px)",
              },
              gap: 1,
              alignItems: "start",
            }}
          >
            <ProjectMatchTeamsPanel
              projectId={project.id}
              redTeams={overview.redTeams}
              blueTeams={overview.blueTeams}
              redScore={overview.redScore}
              blueScore={overview.blueScore}
            />
            <ProjectMatchTeamRankingsChart
              redTeams={overview.redTeams}
              blueTeams={overview.blueTeams}
              teamCount={overview.teamCount}
            />
          </Box>

          {!hasMatchData(project.dataMode) ? (
            <Alert severity="info">
              <AlertTitle>Match scouting is not enabled</AlertTitle>
              This project is not currently configured to collect match scouting
              data, so this page only shows official TBA match information.
            </Alert>
          ) : null}

          {hasMatchData(project.dataMode) &&
          overview.missingScouting.missingSlots.length > 0 ? (
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexWrap="wrap"
            >
              <WarningAmberIcon sx={{ fontSize: 16, color: "warning.main" }} />
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ fontWeight: 600 }}
              >
                Missing scouting data:
              </Typography>
              {overview.missingScouting.missingSlots.map((slot) => (
                <Chip
                  key={String(slot)}
                  label={String(slot)}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: "0.68rem", height: 20 }}
                />
              ))}
            </Stack>
          ) : null}

          {hasMatchData(project.dataMode) && !overview.hasMatchQuestionnaire ? (
            <Alert severity="info">
              <AlertTitle>No Questionnaire Configured</AlertTitle>
              This project does not currently have a match scouting
              questionnaire configured, so there is no raw scouting table to
              show for this match.
            </Alert>
          ) : null}

          {overview.matchRawTable ? (
            <ProjectTeamRawDataAccordion
              table={overview.matchRawTable}
              defaultExpanded
            />
          ) : null}
        </Stack>
      </ProjectAccessGuard>
    </PageShell>
  );
}
