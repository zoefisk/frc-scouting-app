import { adminDb } from "@/lib/firebase/admin";
import { MatchScoutingEntryDoc } from "@/lib/firebase/types";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

export async function getAllMatchScoutingEntriesForEvent(
    eventKey: string
): Promise<MatchScoutingEntryDoc[]> {
    const snapshot = await adminDb
        .collectionGroup("entries")
        .where("eventKey", "==", eventKey)
        .orderBy("matchNumber", "asc")
        .get();

    return snapshot.docs.map(
        (doc: QueryDocumentSnapshot) => doc.data() as MatchScoutingEntryDoc
    );
}
