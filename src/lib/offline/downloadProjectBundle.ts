"use client";

import { getScoutingProjectClient } from "@/lib/firebase/client/projects";
import { listProjectQuestionnairesClient } from "@/lib/firebase/client/questionnaires";
import { saveOfflineProjectBundleRecord } from "@/lib/db/offlineProjects";
import { downloadEventBundle } from "@/lib/offline/downloadEventBundle";

export async function downloadProjectBundle(projectId: string) {
  const project = await getScoutingProjectClient(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const questionnaires = await listProjectQuestionnairesClient(projectId);
  const now = new Date().toISOString();

  await downloadEventBundle(project.eventKey, project.name, project.year);

  await saveOfflineProjectBundleRecord({
    projectId: project.id,
    projectName: project.name,
    eventKey: project.eventKey,
    year: project.year,
    dataMode: project.dataMode,
    accessMode: project.accessMode,
    status: project.status,
    activeQuestionnaireIds: project.activeQuestionnaireIds,
    questionnaireCount: questionnaires.length,
    cachedAt: now,
    lastUpdatedAt: now,
    project,
    questionnaires,
  });
}
