"use client";

import { getAppSetting, saveAppSetting } from "@/lib/db/indexDb";
import type {
  ProjectAccessMode,
  ProjectDataMode,
  ProjectMemberRole,
  ProjectStatus,
} from "@/lib/scouting-projects/types";

const JOINED_SCOUTING_PROJECTS_KEY = "joinedScoutingProjects";
const PINNED_SCOUTING_PROJECT_IDS_KEY = "pinnedScoutingProjectIds";
const ARCHIVED_SCOUTING_PROJECT_IDS_KEY = "archivedScoutingProjectIds";
export const PINNED_SCOUTING_PROJECTS_CHANGED_EVENT =
  "scouting-projects:pinned-changed";
export const ARCHIVED_SCOUTING_PROJECTS_CHANGED_EVENT =
  "scouting-projects:archived-changed";

export type JoinedScoutingProjectRecord = {
  projectId: string;
  name: string;
  eventKey: string;
  year: number;
  status: ProjectStatus;
  accessMode: ProjectAccessMode;
  dataMode: ProjectDataMode;
  memberRole?: ProjectMemberRole | null;
  inviteLinkToken: string;
  joinedAt: string;
  lastOpenedAt: string;
};

export async function getJoinedScoutingProjects(): Promise<
  JoinedScoutingProjectRecord[]
> {
  const existing =
    (await getAppSetting<JoinedScoutingProjectRecord[]>(
      JOINED_SCOUTING_PROJECTS_KEY
    )) ?? [];

  return existing
    .map((project) => ({
      ...project,
      status:
        project.status === "inactive"
          ? ("inactive" as const)
          : ("active" as const),
    }))
    .sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt));
}

export async function saveJoinedScoutingProject(
  project: Omit<JoinedScoutingProjectRecord, "lastOpenedAt">
): Promise<void> {
  const existing = await getJoinedScoutingProjects();
  const now = new Date().toISOString();

  const next: JoinedScoutingProjectRecord[] = [
    {
      ...project,
      lastOpenedAt: now,
    },
    ...existing.filter((item) => item.projectId !== project.projectId),
  ];

  await saveAppSetting(JOINED_SCOUTING_PROJECTS_KEY, next);
}

export async function markJoinedScoutingProjectOpened(
  projectId: string
): Promise<void> {
  const existing = await getJoinedScoutingProjects();
  const now = new Date().toISOString();

  const next = existing.map((item) =>
    item.projectId === projectId ? { ...item, lastOpenedAt: now } : item
  );

  await saveAppSetting(JOINED_SCOUTING_PROJECTS_KEY, next);
}

export async function removeJoinedScoutingProject(
  projectId: string
): Promise<void> {
  const existing = await getJoinedScoutingProjects();
  const next = existing.filter((item) => item.projectId !== projectId);
  await saveAppSetting(JOINED_SCOUTING_PROJECTS_KEY, next);
}

export async function getPinnedScoutingProjectIds(): Promise<string[]> {
  const existing =
    (await getAppSetting<string[]>(PINNED_SCOUTING_PROJECT_IDS_KEY)) ?? [];

  return existing.filter(
    (projectId, index) =>
      typeof projectId === "string" &&
      projectId.trim() !== "" &&
      existing.indexOf(projectId) === index
  );
}

function haveSamePinnedIds(current: string[], next: string[]): boolean {
  return (
    current.length === next.length &&
    current.every((projectId, index) => projectId === next[index])
  );
}

function emitPinnedProjectsChanged(nextPinnedIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(PINNED_SCOUTING_PROJECTS_CHANGED_EVENT, {
      detail: { pinnedProjectIds: nextPinnedIds },
    })
  );
}

function emitArchivedProjectsChanged(nextArchivedIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ARCHIVED_SCOUTING_PROJECTS_CHANGED_EVENT, {
      detail: { archivedProjectIds: nextArchivedIds },
    })
  );
}

export async function pinScoutingProject(projectId: string): Promise<void> {
  const existing = await getPinnedScoutingProjectIds();

  if (existing.includes(projectId)) {
    return;
  }

  const nextPinnedIds = [projectId, ...existing];

  await saveAppSetting(PINNED_SCOUTING_PROJECT_IDS_KEY, nextPinnedIds);

  if (!haveSamePinnedIds(existing, nextPinnedIds)) {
    emitPinnedProjectsChanged(nextPinnedIds);
  }
}

export async function unpinScoutingProject(projectId: string): Promise<void> {
  const existing = await getPinnedScoutingProjectIds();
  const nextPinnedIds = existing.filter((id) => id !== projectId);

  await saveAppSetting(PINNED_SCOUTING_PROJECT_IDS_KEY, nextPinnedIds);

  if (!haveSamePinnedIds(existing, nextPinnedIds)) {
    emitPinnedProjectsChanged(nextPinnedIds);
  }
}

export async function getArchivedScoutingProjectIds(): Promise<string[]> {
  const existing =
    (await getAppSetting<string[]>(ARCHIVED_SCOUTING_PROJECT_IDS_KEY)) ?? [];

  return existing.filter(
    (projectId, index) =>
      typeof projectId === "string" &&
      projectId.trim() !== "" &&
      existing.indexOf(projectId) === index
  );
}

export async function archiveScoutingProjectLocally(
  projectId: string
): Promise<void> {
  const existing = await getArchivedScoutingProjectIds();

  if (existing.includes(projectId)) {
    return;
  }

  const nextArchivedIds = [projectId, ...existing];
  await saveAppSetting(ARCHIVED_SCOUTING_PROJECT_IDS_KEY, nextArchivedIds);

  if (!haveSamePinnedIds(existing, nextArchivedIds)) {
    emitArchivedProjectsChanged(nextArchivedIds);
  }
}

export async function restoreArchivedScoutingProjectLocally(
  projectId: string
): Promise<void> {
  const existing = await getArchivedScoutingProjectIds();
  const nextArchivedIds = existing.filter((id) => id !== projectId);

  await saveAppSetting(ARCHIVED_SCOUTING_PROJECT_IDS_KEY, nextArchivedIds);

  if (!haveSamePinnedIds(existing, nextArchivedIds)) {
    emitArchivedProjectsChanged(nextArchivedIds);
  }
}
