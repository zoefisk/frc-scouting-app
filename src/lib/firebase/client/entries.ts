import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/app";

type SaveMatchScoutingEntryArgs = {
  eventKey: string;
  matchNumber: number;
  entryId: string;
  payload: Record<string, unknown>;
};

export async function saveMatchScoutingEntry({
  eventKey,
  matchNumber,
  entryId,
  payload,
}: SaveMatchScoutingEntryArgs) {
  const matchKey = `qm${matchNumber}`;

  const entriesRef = collection(
    db,
    "events",
    eventKey,
    "matches",
    matchKey,
    "entries"
  );
  const entryRef = doc(entriesRef, entryId);

  await setDoc(entryRef, payload);
}

type SavePitScoutingEntryArgs = {
  eventKey: string;
  teamKey: string;
  entryId: string;
  payload: Record<string, unknown>;
};

export async function savePitScoutingEntry({
  eventKey,
  teamKey,
  entryId,
  payload,
}: SavePitScoutingEntryArgs) {
  const entriesRef = collection(
    db,
    "events",
    eventKey,
    "pitEntries",
    teamKey,
    "entries"
  );
  const entryRef = doc(entriesRef, entryId);

  await setDoc(entryRef, payload);
}
