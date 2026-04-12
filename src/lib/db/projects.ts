"use client";

import { getAppSetting, saveAppSetting } from "@/lib/db/indexDb";
import type {
  ProjectAccessMode,
  ProjectDataMode,
  ProjectFormMode,
} from "@/lib/scouting-projects/types";

const JOINED_SCOUTING_PROJECTS_KEY = "joinedScoutingProjects";
const PINNED_SCOUTING_PROJECT_IDS_KEY = "pinnedScoutingProjectIds";

export type JoinedScoutingProjectRecord = {
  projectId: string;
  name: string;
  eventKey: string;
  year: number;
  accessMode: ProjectAccessMode;
  dataMode: ProjectDataMode;
  formMode: ProjectFormMode;
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

  return [...existing].sort((a, b) =>
    b.lastOpenedAt.localeCompare(a.lastOpenedAt)
  );
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

export async function pinScoutingProject(projectId: string): Promise<void> {
  const existing = await getPinnedScoutingProjectIds();

  if (existing.includes(projectId)) {
    return;
  }

  await saveAppSetting(PINNED_SCOUTING_PROJECT_IDS_KEY, [
    projectId,
    ...existing,
  ]);
}

export async function unpinScoutingProject(projectId: string): Promise<void> {
  const existing = await getPinnedScoutingProjectIds();
  await saveAppSetting(
    PINNED_SCOUTING_PROJECT_IDS_KEY,
    existing.filter((id) => id !== projectId)
  );
}
