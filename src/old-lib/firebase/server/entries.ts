import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { MatchScoutingEntryDoc } from "@/old-lib/firebase/shared/types";
import { getAdminDb } from "@/old-lib/firebase/server/admin";

export async function getTeamMatchScoutingEntries(
  eventKey: string,
  teamNumber: number
): Promise<MatchScoutingEntryDoc[]> {
  const snapshot = await getAdminDb()
    .collectionGroup("entries")
    .where("eventKey", "==", eventKey)
    .where("teamNumber", "==", teamNumber)
    .orderBy("matchNumber", "asc")
    .get();

  return snapshot.docs.map(
    (doc: QueryDocumentSnapshot) => doc.data() as MatchScoutingEntryDoc
  );
}

export async function getAllMatchScoutingEntriesForEvent(
  eventKey: string
): Promise<MatchScoutingEntryDoc[]> {
  const snapshot = await getAdminDb()
    .collectionGroup("entries")
    .where("eventKey", "==", eventKey)
    .get();

  return snapshot.docs
    .map((doc: QueryDocumentSnapshot) => doc.data() as MatchScoutingEntryDoc)
    .sort((a, b) => a.matchNumber - b.matchNumber);
}
