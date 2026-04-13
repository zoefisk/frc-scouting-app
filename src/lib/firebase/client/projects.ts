import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  runTransaction,
  where,
  type DocumentData,
} from "firebase/firestore";
import {
  ProjectAllianceSelectorRole,
  ProjectMemberRole,
  ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";
import { db } from "@/lib/firebase/client/app";

const PROJECTS_COLLECTION = "scoutingProjects";

type CreateScoutingProjectClientInput = Omit<
  ScoutingProjectDoc,
  "createdAt" | "updatedAt"
>;

function normalizeProjectDoc(
  id: string,
  data: DocumentData
): ScoutingProjectDoc & { id: string } {
  const createdByUid = String(data.createdByUid ?? "");
  const existingMembers = Array.isArray(data.members) ? data.members : [];
  const fallbackOwner = createdByUid
    ? [
        {
          uid: createdByUid,
          role: "owner" as const,
          allianceSelectorRole: null,
        },
      ]
    : [];
  const members = (
    existingMembers.length > 0 ? existingMembers : fallbackOwner
  ).map((member) => ({
    uid: String(member.uid ?? ""),
    role:
      member.role === "owner" || member.role === "admin"
        ? member.role
        : ("member" as const),
    allianceSelectorRole:
      member.allianceSelectorRole === "student_leader"
        ? ("student_leader" as ProjectAllianceSelectorRole)
        : null,
  }));
  const memberUids = Array.isArray(data.memberUids)
    ? data.memberUids
    : members.map((member) => member.uid);

  return {
    id,
    ...(data as ScoutingProjectDoc),
    status: data.status === "inactive" ? "inactive" : "active",
    allowMemberInvites:
      typeof data.allowMemberInvites === "boolean"
        ? data.allowMemberInvites
        : true,
    lockAllianceSelectorEditing:
      typeof data.lockAllianceSelectorEditing === "boolean"
        ? data.lockAllianceSelectorEditing
        : false,
    members,
    memberUids,
  };
}

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

  return normalizeProjectDoc(snap.id, snap.data());
}

export async function listScoutingProjectsForUserClient(
  uid: string
): Promise<Array<ScoutingProjectDoc & { id: string }>> {
  const [memberSnap, ownerSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, PROJECTS_COLLECTION),
        where("memberUids", "array-contains", uid),
        orderBy("updatedAt", "desc")
      )
    ),
    getDocs(
      query(
        collection(db, PROJECTS_COLLECTION),
        where("createdByUid", "==", uid),
        orderBy("updatedAt", "desc")
      )
    ),
  ]);

  const projectMap = new Map<string, ScoutingProjectDoc & { id: string }>();

  for (const docSnap of [...memberSnap.docs, ...ownerSnap.docs]) {
    projectMap.set(docSnap.id, normalizeProjectDoc(docSnap.id, docSnap.data()));
  }

  return [...projectMap.values()].sort((a, b) =>
    String(b.updatedAt).localeCompare(String(a.updatedAt))
  );
}

export async function updateScoutingProjectClient(
  projectId: string,
  updates: Partial<
    Pick<
      ScoutingProjectDoc,
      | "name"
      | "teamKeys"
      | "accessMode"
      | "status"
      | "allowMemberInvites"
      | "lockAllianceSelectorEditing"
      | "dataMode"
      | "matchCollectionMode"
      | "formMode"
      | "memberUids"
      | "members"
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

export async function addScoutingProjectMemberClient(
  projectId: string,
  member: { uid: string; role: ProjectMemberRole }
): Promise<void> {
  const ref = doc(db, PROJECTS_COLLECTION, projectId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);

    if (!snap.exists()) {
      throw new Error("Project not found.");
    }

    const project = snap.data() as ScoutingProjectDoc;
    const members = project.members ?? [];
    const existing = members.find((entry) => entry.uid === member.uid);

    const nextMembers = existing
      ? members.map((entry) =>
          entry.uid === member.uid ? { ...entry, role: member.role } : entry
        )
      : [...members, member];

    transaction.update(ref, {
      members: nextMembers,
      memberUids: arrayUnion(member.uid),
      updatedAt: serverTimestamp(),
    });
  });
}
