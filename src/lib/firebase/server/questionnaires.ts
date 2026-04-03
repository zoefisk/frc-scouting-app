// src/lib/firebase/server/questionnaires.ts

import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/server/admin";
import type { ProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/types";

const QUESTIONNAIRES_COLLECTION = "questionnaires";
const db = getAdminDb();

type CreateProjectQuestionnaireServerInput = Omit<
  ProjectQuestionnaireDoc,
  "createdAt" | "updatedAt"
>;

function normalizeFirestoreTimestamps<T extends Record<string, unknown>>(
  data: T
): T {
  const out: Record<string, unknown> = { ...data };

  for (const [key, value] of Object.entries(out)) {
    if (value instanceof Timestamp) {
      out[key] = value.toDate().toISOString();
    }
  }

  return out as T;
}

export async function createProjectQuestionnaireServerWithId(
  questionnaireId: string,
  input: CreateProjectQuestionnaireServerInput
): Promise<string> {
  await db
    .collection(QUESTIONNAIRES_COLLECTION)
    .doc(questionnaireId)
    .set({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return questionnaireId;
}

export async function getProjectQuestionnaireServer(
  questionnaireId: string
): Promise<(ProjectQuestionnaireDoc & { id: string }) | null> {
  const snap = await db
    .collection(QUESTIONNAIRES_COLLECTION)
    .doc(questionnaireId)
    .get();

  if (!snap.exists) {
    return null;
  }

  return {
    id: snap.id,
    ...(normalizeFirestoreTimestamps(
      snap.data() as Record<string, unknown>
    ) as ProjectQuestionnaireDoc),
  };
}

export async function listProjectQuestionnairesServer(
  projectId: string
): Promise<Array<ProjectQuestionnaireDoc & { id: string }>> {
  const snap = await db
    .collection(QUESTIONNAIRES_COLLECTION)
    .where("projectId", "==", projectId)
    .orderBy("updatedAt", "desc")
    .get();

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(normalizeFirestoreTimestamps(
      docSnap.data() as Record<string, unknown>
    ) as ProjectQuestionnaireDoc),
  }));
}

export async function listProjectQuestionnairesByKindServer(
  projectId: string,
  kind: ProjectQuestionnaireDoc["kind"]
): Promise<Array<ProjectQuestionnaireDoc & { id: string }>> {
  const snap = await db
    .collection(QUESTIONNAIRES_COLLECTION)
    .where("projectId", "==", projectId)
    .where("kind", "==", kind)
    .orderBy("updatedAt", "desc")
    .get();

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(normalizeFirestoreTimestamps(
      docSnap.data() as Record<string, unknown>
    ) as ProjectQuestionnaireDoc),
  }));
}

export async function updateProjectQuestionnaireServer(
  questionnaireId: string,
  updates: Partial<
    Pick<
      ProjectQuestionnaireDoc,
      "name" | "version" | "isActive" | "basedOnQuestionnaireId" | "definition"
    >
  >
): Promise<void> {
  await db
    .collection(QUESTIONNAIRES_COLLECTION)
    .doc(questionnaireId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
}
