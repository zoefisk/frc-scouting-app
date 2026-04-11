"use client";

import Link from "next/link";
import { Alert, Button, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  description: string;
};

export default function ProjectRequiredPageContent({
  title,
  description,
}: Props) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Typography color="text.secondary">{description}</Typography>

      <Alert severity="info">
        Open this tool from a scouting project so the event, access rules, and
        saved data stay tied to the right project.
      </Alert>

      <Link href="/scouting-projects" style={{ textDecoration: "none" }}>
        <Button variant="contained">Open Scouting Projects</Button>
      </Link>
    </Stack>
  );
}
