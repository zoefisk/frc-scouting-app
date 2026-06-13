import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/server/admin";
import {
  deleteProjectMatchScoutingEntries,
  deleteProjectPitScoutingEntries,
} from "@/lib/firebase/server/entries";
import { deleteProjectQuestionnairesServer } from "@/lib/firebase/server/questionnaires";
import {
  getScoutingScheduleBlockSize,
  ProjectAllianceSelectorRole,
  ProjectMemberRole,
  ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";
import { deleteAllianceSelectorServer } from "@/lib/firebase/server/allianceSelector";

const PROJECTS_COLLECTION = "scoutingProjects";
const db = getAdminDb();

type CreateScoutingProjectServerInput = Omit<
  ScoutingProjectDoc,
  "createdAt" | "updatedAt"
>;

function normalizeProjectDoc(
  data: Record<string, unknown>
): ScoutingProjectDoc {
  const normalized = normalizeFirestoreTimestamps(data);
  const createdByUid = String(normalized.createdByUid ?? "");
  const existingMembers = Array.isArray(normalized.members)
    ? normalized.members
    : [];
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
  const memberUids = Array.isArray(normalized.memberUids)
    ? normalized.memberUids
    : members.map((member) => member.uid);
  const scoutingSchedule =
    normalized.scoutingSchedule &&
    typeof normalized.scoutingSchedule === "object" &&
    !Array.isArray(normalized.scoutingSchedule) &&
    (normalized.scoutingSchedule as { mode?: unknown }).mode &&
    Array.isArray(
      (normalized.scoutingSchedule as { scouterNames?: unknown }).scouterNames
    ) &&
    Array.isArray(
      (normalized.scoutingSchedule as { matches?: unknown }).matches
    ) &&
    typeof (normalized.scoutingSchedule as { updatedAt?: unknown })
      .updatedAt === "string"
      ? {
          mode: (
            normalized.scoutingSchedule as {
              mode: NonNullable<ScoutingProjectDoc["scoutingSchedule"]>["mode"];
            }
          ).mode,
          blockSize: getScoutingScheduleBlockSize(
            (normalized.scoutingSchedule as { blockSize?: number }).blockSize
          ),
          scouterNames: (
            normalized.scoutingSchedule as { scouterNames: string[] }
          ).scouterNames,
          matches: (
            normalized.scoutingSchedule as {
              matches: NonNullable<
                ScoutingProjectDoc["scoutingSchedule"]
              >["matches"];
            }
          ).matches,
          updatedAt: (normalized.scoutingSchedule as { updatedAt: string })
            .updatedAt,
        }
      : undefined;

  return {
    ...(normalized as ScoutingProjectDoc),
    status: normalized.status === "inactive" ? "inactive" : "active",
    allowMemberInvites:
      typeof normalized.allowMemberInvites === "boolean"
        ? normalized.allowMemberInvites
        : true,
    lockAllianceSelectorEditing:
      typeof normalized.lockAllianceSelectorEditing === "boolean"
        ? normalized.lockAllianceSelectorEditing
        : false,
    scoutingSchedule,
    members,
    memberUids,
  };
}

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
    ...normalizeProjectDoc(snap.data() as Record<string, unknown>),
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
    ...normalizeProjectDoc(docSnap.data() as Record<string, unknown>),
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
    ...normalizeProjectDoc(docSnap.data() as Record<string, unknown>),
  };
}

export async function listScoutingProjectsForUserServer(
  uid: string
): Promise<Array<ScoutingProjectDoc & { id: string }>> {
  const [memberSnap, ownerSnap] = await Promise.all([
    db
      .collection(PROJECTS_COLLECTION)
      .where("memberUids", "array-contains", uid)
      .orderBy("updatedAt", "desc")
      .get(),
    db
      .collection(PROJECTS_COLLECTION)
      .where("createdByUid", "==", uid)
      .orderBy("updatedAt", "desc")
      .get(),
  ]);

  const projectMap = new Map<string, ScoutingProjectDoc & { id: string }>();

  for (const docSnap of [...memberSnap.docs, ...ownerSnap.docs]) {
    projectMap.set(docSnap.id, {
      id: docSnap.id,
      ...normalizeProjectDoc(docSnap.data() as Record<string, unknown>),
    });
  }

  return [...projectMap.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function updateScoutingProjectServer(
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
      | "memberUids"
      | "members"
      | "activeQuestionnaireIds"
    >
  > & {
    scoutingSchedule?: ScoutingProjectDoc["scoutingSchedule"] | null;
  }
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

export async function deleteScoutingProjectCascadeServer(
  projectId: string
): Promise<void> {
  const project = await getScoutingProjectServer(projectId);

  if (!project) {
    return;
  }

  await Promise.all([
    deleteProjectMatchScoutingEntries(projectId, project.eventKey),
    deleteProjectPitScoutingEntries(projectId, project.eventKey),
    deleteProjectQuestionnairesServer(projectId),
    deleteAllianceSelectorServer(projectId),
  ]);

  await Promise.all(
    (project.memberUids ?? []).map((uid) =>
      db
        .collection("users")
        .doc(uid)
        .set(
          {
            joinedProjectIds: FieldValue.arrayRemove(projectId),
          },
          { merge: true }
        )
    )
  );

  await deleteScoutingProjectServer(projectId);
}

export async function addScoutingProjectMemberServer(
  projectId: string,
  member: { uid: string; role: ProjectMemberRole }
): Promise<void> {
  const ref = db.collection(PROJECTS_COLLECTION).doc(projectId);

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);

    if (!snap.exists) {
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

    const nextMemberUids = Array.from(
      new Set([...(project.memberUids ?? []), member.uid])
    ).sort();

    transaction.update(ref, {
      members: nextMembers,
      memberUids: nextMemberUids,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}
