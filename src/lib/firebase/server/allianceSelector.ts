import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/server/admin";
import {
  ALLIANCE_SELECTOR_DOC_ID,
  type AllianceSelectorDoc,
} from "@/lib/scouting-projects/alliance-selector";

const db = getAdminDb();

function normalizeAllianceSelectorDoc(
  data: Record<string, unknown>
): AllianceSelectorDoc {
  return {
    projectId: String(data.projectId ?? ""),
    year: Number(data.year ?? 0),
    eventKey: String(data.eventKey ?? ""),
    teams: Array.isArray(data.teams)
      ? (data.teams as AllianceSelectorDoc["teams"])
      : [],
    removedTeams: Array.isArray(data.removedTeams)
      ? (data.removedTeams as AllianceSelectorDoc["removedTeams"])
      : [],
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : String(data.updatedAt ?? new Date(0).toISOString()),
    updatedByUid:
      typeof data.updatedByUid === "string" ? data.updatedByUid : null,
  };
}

function getAllianceSelectorRef(projectId: string) {
  return db
    .collection("scoutingProjects")
    .doc(projectId)
    .collection("allianceSelector")
    .doc(ALLIANCE_SELECTOR_DOC_ID);
}

export async function getAllianceSelectorServer(
  projectId: string
): Promise<AllianceSelectorDoc | null> {
  const snap = await getAllianceSelectorRef(projectId).get();

  if (!snap.exists) {
    return null;
  }

  return normalizeAllianceSelectorDoc(snap.data() as Record<string, unknown>);
}

export async function saveAllianceSelectorServer(
  projectId: string,
  input: Omit<AllianceSelectorDoc, "updatedAt">
): Promise<void> {
  await getAllianceSelectorRef(projectId).set({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteAllianceSelectorServer(
  projectId: string
): Promise<void> {
  await getAllianceSelectorRef(projectId)
    .delete()
    .catch((error: unknown) => {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";

      if (code === "5" || code === "not-found") {
        return;
      }

      throw error;
    });
}
