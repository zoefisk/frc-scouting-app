import { Alert, Stack, Typography } from "@mui/material";
import PageShell from "@/components/app/layout/PageShell";

type Props = {
  params: Promise<{
    eventKey: string;
    teamKey: string;
  }>;
};

export default async function TeamAnalysisPage({ params }: Props) {
  const { eventKey, teamKey } = await params;

  return (
    <PageShell width="md">
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Team Analysis
        </Typography>

        <Typography color="text.secondary">
          Detailed analysis for {teamKey} at {eventKey} is not available yet.
        </Typography>

        <Alert severity="info">
          This route is reserved for team-level scouting summaries, match
          history, and comparison views once the analysis pipeline is ready.
        </Alert>
      </Stack>
    </PageShell>
  );
}
