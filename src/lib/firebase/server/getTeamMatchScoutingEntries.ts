import { adminDb } from "@/lib/firebase/admin";
import { MatchScoutingEntryDoc } from "@/lib/firebase/types";
import {firestore} from "firebase-admin";
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

export async function getTeamMatchScoutingEntries(
    eventKey: string,
    teamNumber: number
): Promise<MatchScoutingEntryDoc[]> {
    const snapshot = await adminDb
        .collectionGroup("entries")
        .where("eventKey", "==", eventKey)
        .where("teamNumber", "==", teamNumber)
        .orderBy("matchNumber", "asc")
        .get();

    return snapshot.docs.map(
        (doc: QueryDocumentSnapshot) => doc.data() as MatchScoutingEntryDoc
    );
}
