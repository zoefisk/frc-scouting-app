import PageShell from "@/components/layout/PageShell";
import { Button, Typography } from "@mui/material";
import React from "react";

export default function ScoutingProjectsPage() {
  return (
    <PageShell width={"xl"}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Scouting Projects
      </Typography>
      <Typography color="text.secondary">
        View your scouting projects or create a new one.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        href={"/scouting-projects/new"}
      >
        Create New Scouting Project
      </Button>
    </PageShell>
  );
}
