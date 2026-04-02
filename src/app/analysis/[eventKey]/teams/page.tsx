import { Typography } from "@mui/material";
import TeamsTable from "@/components/analysis/TeamsTable";
import PageShell from "@/components/layout/PageShell";
import { getEventTeamsWithRanks } from "@/old-lib/tba/server/teams";

type Props = {
  params: Promise<{
    eventKey: string;
  }>;
};

export default async function TeamsPage({ params }: Props) {
  const { eventKey } = await params;
  const teams = await getEventTeamsWithRanks(eventKey);

  return (
    <PageShell>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Teams at {eventKey}
      </Typography>

      <TeamsTable eventKey={eventKey} teams={teams} />
    </PageShell>
  );
}
