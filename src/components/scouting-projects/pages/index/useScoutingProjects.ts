"use client";

import React from "react";
import { useAuth } from "@/components/app/providers/AuthProvider";
import {
  getJoinedScoutingProjects,
  getPinnedScoutingProjectIds,
  PINNED_SCOUTING_PROJECTS_CHANGED_EVENT,
  pinScoutingProject,
  unpinScoutingProject,
} from "@/lib/db/projects";
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

  const loadProjects = React.useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      setError(null);

      const projectMap = new Map<string, ProjectListItem>();
      const pinnedProjectIds = await getPinnedScoutingProjectIds();
      const pinnedProjectIdSet = new Set(pinnedProjectIds);

      const joinedOnDevice = await getJoinedScoutingProjects();
      for (const project of joinedOnDevice) {
        upsertProject(projectMap, {
          id: project.projectId,
          name: project.name,
          eventKey: project.eventKey,
          year: project.year,
          status: project.status,
          dataMode: project.dataMode,
          accessMode: project.accessMode,
          source: "device",
          pinned: pinnedProjectIdSet.has(project.projectId),
        });
      }

      if (user) {
        const ownedProjects = await listScoutingProjectsForUserClient(user.uid);
        for (const project of ownedProjects) {
          const role = getProjectMemberRole(project, user.uid);

          upsertProject(projectMap, {
            id: project.id,
            name: project.name,
            eventKey: project.eventKey,
            year: project.year,
            status: project.status,
            dataMode: project.dataMode,
            accessMode: project.accessMode,
            source: role === "owner" || role === "admin" ? "owned" : "joined",
            pinned: pinnedProjectIdSet.has(project.id),
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
              status: project.status,
              dataMode: project.dataMode,
              accessMode: project.accessMode,
              source: "joined",
              pinned: pinnedProjectIdSet.has(project.id),
            });
          }
        }
      }

      const nextProjects = [...projectMap.values()].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        if (a.year !== b.year) return b.year - a.year;
        return a.name.localeCompare(b.name);
      });

      setProjects(nextProjects);
    } catch (err) {
      console.error("Failed to load scouting projects:", err);
      setError("Could not load your scouting projects.");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user]);

  React.useEffect(() => {
    let cancelled = false;

    if (loading) return;
    void (async () => {
      await loadProjects();
      if (cancelled) {
        return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, loadProjects]);

  React.useEffect(() => {
    function handlePinnedProjectsChanged() {
      void loadProjects();
    }

    window.addEventListener(
      PINNED_SCOUTING_PROJECTS_CHANGED_EVENT,
      handlePinnedProjectsChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        PINNED_SCOUTING_PROJECTS_CHANGED_EVENT,
        handlePinnedProjectsChanged as EventListener
      );
    };
  }, [loadProjects]);

  const togglePinned = React.useCallback(
    async (projectId: string, pinned: boolean) => {
      if (pinned) {
        await unpinScoutingProject(projectId);
      } else {
        await pinScoutingProject(projectId);
      }
    },
    []
  );

  return {
    projects,
    error,
    isLoading: loading || isLoadingProjects,
    togglePinned,
  };
}
