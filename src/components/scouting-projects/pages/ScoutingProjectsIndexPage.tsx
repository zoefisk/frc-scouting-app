import { Button, Stack, Typography } from "@mui/material";
import React from "react";

export default function ScoutingProjectsIndexPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Scouting Projects
      </Typography>

      <Typography color="text.secondary">
        View your scouting projects or create a new one.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ alignSelf: "flex-start" }}
        href="/scouting-projects/new"
      >
        Create New Scouting Project
      </Button>
    </Stack>
  );
}
