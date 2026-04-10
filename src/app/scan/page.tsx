import { Alert, Stack, Typography } from "@mui/material";
import PageShell from "@/components/app/layout/PageShell";

export default function ScanPage() {
  return (
    <PageShell width="md">
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scan QR Codes
        </Typography>

        <Typography color="text.secondary">
          The QR scanner flow is not wired into this route yet.
        </Typography>

        <Alert severity="info">
          This page is reserved for importing scouting data from QR codes once
          the scanner workflow is finished.
        </Alert>
      </Stack>
    </PageShell>
  );
}
