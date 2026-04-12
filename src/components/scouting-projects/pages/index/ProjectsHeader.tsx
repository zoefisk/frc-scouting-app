"use client";

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import JoinProjectMenu from "@/components/scouting-projects/pages/index/JoinProjectMenu";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";

export default function ProjectsHeader() {
  const { effectiveOnline } = useSyncMode();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scouting Projects
        </Typography>

        <Typography color="text.secondary">
          View every scouting project you own, joined, or saved on this device.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          component={Link}
          href="/scouting-projects/new"
          variant="contained"
          disabled={!effectiveOnline}
        >
          Create New Project
        </Button>

        <JoinProjectMenu />
      </Stack>
    </Stack>
  );
}
