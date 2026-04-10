import PageShell from "@/components/app/layout/PageShell";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageShell>
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            404
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Page not found
          </Typography>

          <Typography color="text.secondary" maxWidth={500}>
            The page you’re looking for doesn’t exist or may have been moved.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button component={Link} href="/" variant="contained">
              Go Home
            </Button>

            <Button
              component={Link}
              href="/scouting-projects"
              variant="outlined"
            >
              View Projects
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageShell>
  );
}
