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
  const matchRef = doc(db, "events", eventKey, "matches", matchKey);
  const entriesRef = collection(matchRef, "entries");
  const entryRef = doc(entriesRef, entryId);

  await setDoc(
    matchRef,
    {
      key: `${eventKey}_${matchKey}`,
      comp_level: "qm",
      match_number: matchNumber,
    },
    { merge: true }
  );
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
  const teamRef = doc(db, "events", eventKey, "pitEntries", teamKey);
  const entriesRef = collection(teamRef, "entries");
  const entryRef = doc(entriesRef, entryId);

  await setDoc(
    teamRef,
    {
      teamKey,
    },
    { merge: true }
  );
  await setDoc(entryRef, payload);
}
