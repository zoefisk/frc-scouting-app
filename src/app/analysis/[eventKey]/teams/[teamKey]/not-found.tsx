import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import PageShell from "@/components/app/layout/PageShell";

type Props = {
  params?: Promise<{
    eventKey?: string;
  }>;
};

export default async function TeamNotFoundPage({ params }: Props) {
  const resolved = params ? await params : undefined;
  const eventKey = resolved?.eventKey;

  return (
    <PageShell>
      <Stack spacing={3} alignItems="flex-start">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Team not found
          </Typography>
          <Typography color="text.secondary">
            That team does not exist for this event, or the URL is invalid.
          </Typography>
        </Box>

        {eventKey ? (
          <Link
            href={`/analysis/${eventKey}/teams`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained">Back to team list</Button>
          </Link>
        ) : (
          <Link href="/analysis" style={{ textDecoration: "none" }}>
            <Button variant="contained">Back to analysis</Button>
          </Link>
        )}
      </Stack>
    </PageShell>
  );
}
