import "server-only";

import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

// Adjust this import if your admin app file uses a different path/export.
// Common patterns are "@/lib/firebase/server/admin" or "@/lib/firebase/server/app".
import { adminApp } from "@/lib/firebase/server/admin";
import { ScoutingProjectDoc } from "@/lib/scouting-projects/types";

const PROJECTS_COLLECTION = "scoutingProjects";

const db = getFirestore(adminApp);

type CreateScoutingProjectServerInput = Omit<
  ScoutingProjectDoc,
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

export async function createScoutingProjectServer(
  input: CreateScoutingProjectServerInput
): Promise<string> {
  const ref = await db.collection(PROJECTS_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}

export async function createScoutingProjectServerWithId(
  projectId: string,
  input: CreateScoutingProjectServerInput
): Promise<string> {
  await db
    .collection(PROJECTS_COLLECTION)
    .doc(projectId)
    .set({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return projectId;
}

export async function getScoutingProjectServer(
  projectId: string
): Promise<(ScoutingProjectDoc & { id: string }) | null> {
  const snap = await db.collection(PROJECTS_COLLECTION).doc(projectId).get();

  if (!snap.exists) {
    return null;
  }

  return {
    id: snap.id,
    ...(normalizeFirestoreTimestamps(
      snap.data() as Record<string, unknown>
    ) as ScoutingProjectDoc),
  };
}

export async function getScoutingProjectByInviteCodeServer(
  inviteCode: string
): Promise<(ScoutingProjectDoc & { id: string }) | null> {
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .where("inviteCode", "==", inviteCode)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return {
    id: docSnap.id,
    ...(normalizeFirestoreTimestamps(
      docSnap.data() as Record<string, unknown>
    ) as ScoutingProjectDoc),
  };
}

export async function getScoutingProjectByInviteLinkTokenServer(
  inviteLinkToken: string
): Promise<(ScoutingProjectDoc & { id: string }) | null> {
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .where("inviteLinkToken", "==", inviteLinkToken)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return {
    id: docSnap.id,
    ...(normalizeFirestoreTimestamps(
      docSnap.data() as Record<string, unknown>
    ) as ScoutingProjectDoc),
  };
}

export async function listScoutingProjectsForUserServer(
  uid: string
): Promise<Array<ScoutingProjectDoc & { id: string }>> {
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .where("createdByUid", "==", uid)
    .orderBy("updatedAt", "desc")
    .get();

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(normalizeFirestoreTimestamps(
      docSnap.data() as Record<string, unknown>
    ) as ScoutingProjectDoc),
  }));
}

export async function updateScoutingProjectServer(
  projectId: string,
  updates: Partial<
    Pick<
      ScoutingProjectDoc,
      | "name"
      | "teamKeys"
      | "accessMode"
      | "dataMode"
      | "matchCollectionMode"
      | "formMode"
      | "activeQuestionnaireIds"
    >
  >
): Promise<void> {
  await db
    .collection(PROJECTS_COLLECTION)
    .doc(projectId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteScoutingProjectServer(
  projectId: string
): Promise<void> {
  await db.collection(PROJECTS_COLLECTION).doc(projectId).delete();
}
