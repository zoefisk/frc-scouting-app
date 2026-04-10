import { Alert, Stack, Typography } from "@mui/material";
import PageShell from "@/components/app/layout/PageShell";

export default function AnalysisPage() {
  return (
    <PageShell width="md">
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Analysis
        </Typography>

        <Typography color="text.secondary">
          Analysis views are still being built.
        </Typography>

        <Alert severity="info">
          Team and event analysis routes will live here once the reporting
          workflows are connected.
        </Alert>
      </Stack>
    </PageShell>
  );
}
