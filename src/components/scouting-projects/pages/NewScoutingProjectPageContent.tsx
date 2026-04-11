import { Stack } from "@mui/material";
import React from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import ScoutingProjectBuilder from "@/components/scouting-projects/pages/new/ScoutingProjectBuilder";

export default function NewScoutingProjectPageContent() {
  return (
    <RequireAuth>
      <Stack spacing={2}>
        <ScoutingProjectBuilder />
      </Stack>
    </RequireAuth>
  );
}
