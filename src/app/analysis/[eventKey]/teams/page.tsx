import { Alert, Stack, Typography } from "@mui/material";
import PageShell from "@/components/app/layout/PageShell";

type Props = {
  params: Promise<{
    eventKey: string;
  }>;
};

export default async function TeamsPage({ params }: Props) {
  const { eventKey } = await params;

  return (
    <PageShell width="md">
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Teams at {eventKey}
        </Typography>

        <Typography color="text.secondary">
          The event team analysis table is not connected yet.
        </Typography>

        <Alert severity="info">
          This route will list teams and link to team-level analysis once the
          event analysis flow is wired up.
        </Alert>
      </Stack>
    </PageShell>
  );
}
