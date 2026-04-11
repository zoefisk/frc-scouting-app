"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useAuth } from "@/components/app/providers/AuthProvider";
import {
  getScoutingProjectClient,
  listScoutingProjectsForUserClient,
} from "@/lib/firebase/client/projects";
import { getUserProfile } from "@/lib/firebase/client/users";
import { getJoinedScoutingProjects } from "@/lib/db/projects";
import type {
  ProjectAccessMode,
  ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type ProjectListItem = {
  id: string;
  name: string;
  eventKey: string;
  year: number;
  dataMode: ScoutingProjectDoc["dataMode"];
  accessMode: ProjectAccessMode;
  source: "owned" | "joined" | "device";
};

function sourceLabel(source: ProjectListItem["source"]) {
  if (source === "owned") return "OWNER";
  if (source === "joined") return "JOINED";
  return "DEVICE";
}

function upsertProject(
  map: Map<string, ProjectListItem>,
  project: ProjectListItem
) {
  const existing = map.get(project.id);

  if (!existing) {
    map.set(project.id, project);
    return;
  }

  const priority: Record<ProjectListItem["source"], number> = {
    owned: 3,
    joined: 2,
    device: 1,
  };

  if (priority[project.source] > priority[existing.source]) {
    map.set(project.id, project);
  }
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 4,
        p: 3,
        backgroundColor: "white",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="flex-start"
          useFlexGap
          flexWrap="wrap"
        >
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {project.name}
            </Typography>

            <Typography color="text.secondary">
              {project.eventKey} ({project.year})
            </Typography>
          </Stack>

          <Chip
            label={sourceLabel(project.source)}
            size="small"
            sx={{
              backgroundColor: "rgba(15,23,42,0.06)",
              color: "#0f172a",
              fontWeight: 700,
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={`Data: ${project.dataMode}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Access: ${project.accessMode}`}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Box>
          <Link href={`/scouting-projects/${project.id}`}>
            <Button variant="text" sx={{ px: 0 }}>
              Open Project
            </Button>
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

export default function ScoutingProjectsIndexPage() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = React.useState<ProjectListItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        setError(null);

        const projectMap = new Map<string, ProjectListItem>();

        const joinedOnDevice = await getJoinedScoutingProjects();
        for (const project of joinedOnDevice) {
          upsertProject(projectMap, {
            id: project.projectId,
            name: project.name,
            eventKey: project.eventKey,
            year: project.year,
            dataMode: project.dataMode,
            accessMode: project.accessMode,
            source: "device",
          });
        }

        if (user) {
          const ownedProjects = await listScoutingProjectsForUserClient(
            user.uid
          );
          for (const project of ownedProjects) {
            upsertProject(projectMap, {
              id: project.id,
              name: project.name,
              eventKey: project.eventKey,
              year: project.year,
              dataMode: project.dataMode,
              accessMode: project.accessMode,
              source: "owned",
            });
          }

          const profile = await getUserProfile(user.uid);
          const joinedIds = (profile?.joinedProjectIds ?? []).filter(
            (projectId) => !projectMap.has(projectId)
          );

          if (joinedIds.length > 0) {
            const joinedProjects = await Promise.all(
              joinedIds.map((projectId) => getScoutingProjectClient(projectId))
            );

            for (const project of joinedProjects) {
              if (!project) continue;

              upsertProject(projectMap, {
                id: project.id,
                name: project.name,
                eventKey: project.eventKey,
                year: project.year,
                dataMode: project.dataMode,
                accessMode: project.accessMode,
                source: "joined",
              });
            }
          }
        }

        const nextProjects = [...projectMap.values()].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return a.name.localeCompare(b.name);
        });

        if (!cancelled) {
          setProjects(nextProjects);
        }
      } catch (err) {
        console.error("Failed to load scouting projects:", err);
        if (!cancelled) {
          setError("Could not load your scouting projects.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProjects(false);
        }
      }
    }

    if (loading) return;
    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return (
    <Stack spacing={3}>
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
            View every scouting project you own, joined, or saved on this
            device.
          </Typography>
        </Box>

        <Link href="/scouting-projects/new">
          <Button variant="contained">Create New Scouting Project</Button>
        </Link>
      </Stack>

      {loading || isLoadingProjects ? (
        <Typography color="text.secondary">
          Loading scouting projects...
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : projects.length === 0 ? (
        <Box
          sx={{
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 4,
            p: 3,
            backgroundColor: "white",
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No scouting projects yet
            </Typography>

            <Typography color="text.secondary">
              Create a new scouting project or join one from an invite link to
              see it here.
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Box>
      )}
    </Stack>
  );
}
