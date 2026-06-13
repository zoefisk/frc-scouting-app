"use client";

import React from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

export default function ArchivedProjectContent({ children }: Props) {
  return (
    <Stack spacing={2}>
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 700 }}>Archived Project</Typography>
        This scouting project is inactive right now. You can still view it, but
        it is shown in a muted archived state until an owner restores it.
      </Alert>

      <Box
        sx={{
          filter: "grayscale(0.35)",
          opacity: 0.82,
          transition: "filter 0.2s ease, opacity 0.2s ease",
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}
