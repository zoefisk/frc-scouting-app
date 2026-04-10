import { Stack, Typography } from "@mui/material";
import React from "react";
import CreateExampleProjectButton from "@/components/scouting-projects/CreateExampleProjectButton";

export default function NewScoutingProjectPageContent() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Create a New Scouting Project
      </Typography>

      <Typography color="text.secondary">
        Here, you will see settings to create a new scouting project, such as
        selecting which teams to include and which data to track.
      </Typography>

      <CreateExampleProjectButton />
    </Stack>
  );
}
