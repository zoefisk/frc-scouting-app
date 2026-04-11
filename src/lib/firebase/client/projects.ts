import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { ScoutingProjectDoc } from "@/lib/scouting-projects/types";
import { db } from "@/lib/firebase/client/app";

const PROJECTS_COLLECTION = "scoutingProjects";

type CreateScoutingProjectClientInput = Omit<
  ScoutingProjectDoc,
  "createdAt" | "updatedAt"
>;

export async function createScoutingProjectClient(
  input: CreateScoutingProjectClientInput
): Promise<string> {
  const payload: DocumentData = {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, PROJECTS_COLLECTION), payload);
  return ref.id;
}

export async function getScoutingProjectClient(
  projectId: string
): Promise<(ScoutingProjectDoc & { id: string }) | null> {
  const ref = doc(db, PROJECTS_COLLECTION, projectId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...(snap.data() as ScoutingProjectDoc),
  };
}

export async function listScoutingProjectsForUserClient(
  uid: string
): Promise<Array<ScoutingProjectDoc & { id: string }>> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("createdByUid", "==", uid),
    orderBy("updatedAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as ScoutingProjectDoc),
  }));
}

export async function updateScoutingProjectClient(
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
      | "scoutingSchedule"
    >
  >
): Promise<void> {
  const ref = doc(db, PROJECTS_COLLECTION, projectId);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
