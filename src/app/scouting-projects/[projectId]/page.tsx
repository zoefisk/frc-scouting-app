import PageShell from "@/components/layout/PageShell";
import { Chip, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import React from "react";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ScoutingProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = await getScoutingProjectServer(projectId);
  if (!project) notFound();

  return (
    <PageShell width={"xl"}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {project.name}
      </Typography>

      <Stack direction={"column"} spacing={1}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={"EVENT"}
            size="small"
            sx={{
              backgroundColor: "grey.300",
              color: "grey.900",
              fontWeight: 600,
              minWidth: 70,
            }}
          />
          <Typography>
            {project.eventKey} ({project.year})
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={"PARTICIPATING TEAMS"}
            size="small"
            sx={{
              backgroundColor: "grey.300",
              color: "grey.900",
              fontWeight: 600,
              minWidth: 70,
            }}
          />
          <Typography>{project.teamKeys.join(", ")}</Typography>
        </Stack>

        <Typography color="text.secondary">
          Access mode: {project.accessMode}
        </Typography>

        <Typography color="text.secondary">
          Data mode: {project.dataMode}
        </Typography>
      </Stack>
    </PageShell>
  );
}
