"use client";

import React from "react";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { getJoinedScoutingProjects } from "@/lib/db/projects";
import {
  getScoutingProjectClient,
  listScoutingProjectsForUserClient,
} from "@/lib/firebase/client/projects";
import { getUserProfile } from "@/lib/firebase/client/users";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";
import type { ProjectListItem } from "./types";

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

export function useScoutingProjects() {
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
            const role = getProjectMemberRole(project, user.uid);

            upsertProject(projectMap, {
              id: project.id,
              name: project.name,
              eventKey: project.eventKey,
              year: project.year,
              dataMode: project.dataMode,
              accessMode: project.accessMode,
              source: role === "owner" || role === "admin" ? "owned" : "joined",
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

  return {
    projects,
    error,
    isLoading: loading || isLoadingProjects,
  };
}
