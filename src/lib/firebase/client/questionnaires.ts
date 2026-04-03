// src/lib/firebase/client/questionnaires.ts

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

import { db } from "@/lib/firebase/client/app";
import type { ProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/types";

const QUESTIONNAIRES_COLLECTION = "questionnaires";

type CreateProjectQuestionnaireClientInput = Omit<
  ProjectQuestionnaireDoc,
  "createdAt" | "updatedAt"
>;

export async function createProjectQuestionnaireClient(
  input: CreateProjectQuestionnaireClientInput
): Promise<string> {
  const payload: DocumentData = {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, QUESTIONNAIRES_COLLECTION), payload);
  return ref.id;
}

export async function getProjectQuestionnaireClient(
  questionnaireId: string
): Promise<(ProjectQuestionnaireDoc & { id: string }) | null> {
  const ref = doc(db, QUESTIONNAIRES_COLLECTION, questionnaireId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...(snap.data() as ProjectQuestionnaireDoc),
  };
}

export async function listProjectQuestionnairesClient(
  projectId: string
): Promise<Array<ProjectQuestionnaireDoc & { id: string }>> {
  const q = query(
    collection(db, QUESTIONNAIRES_COLLECTION),
    where("projectId", "==", projectId),
    orderBy("updatedAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as ProjectQuestionnaireDoc),
  }));
}

export async function updateProjectQuestionnaireClient(
  questionnaireId: string,
  updates: Partial<
    Pick<
      ProjectQuestionnaireDoc,
      "name" | "version" | "isActive" | "basedOnQuestionnaireId" | "definition"
    >
  >
): Promise<void> {
  const ref = doc(db, QUESTIONNAIRES_COLLECTION, questionnaireId);

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
