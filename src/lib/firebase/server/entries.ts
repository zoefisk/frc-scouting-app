import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";
import { getAdminDb } from "@/lib/firebase/server/admin";
import { ProjectMatchCoverageByMatch } from "@/lib/scouting-projects/matchCoverage";

async function listMatchEntryDocsForEvent(
  eventKey: string
): Promise<MatchScoutingEntryDoc[]> {
  const matchRefs = await getAdminDb()
    .collection("events")
    .doc(eventKey)
    .collection("matches")
    .listDocuments();

  const entrySnapshots = await Promise.all(
    matchRefs.map((matchRef) => matchRef.collection("entries").get())
  );

  return entrySnapshots
    .flatMap((snapshot) =>
      snapshot.docs.map((doc: QueryDocumentSnapshot) => {
        return doc.data() as MatchScoutingEntryDoc;
      })
    )
    .sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0));
}

export async function getTeamMatchScoutingEntries(
  eventKey: string,
  teamNumber: number
): Promise<MatchScoutingEntryDoc[]> {
  const entries = await listMatchEntryDocsForEvent(eventKey);

  return entries.filter((entry) => entry.teamNumber === teamNumber);
}

export async function getAllMatchScoutingEntriesForEvent(
  eventKey: string
): Promise<MatchScoutingEntryDoc[]> {
  return listMatchEntryDocsForEvent(eventKey);
}

type RawEntryWithSetup = {
  setup?: {
    kind?: string | null;
    projectId?: string | null;
    matchNumber?: number | null;
    scoutingPosition?: string | null;
    teamKey?: string | null;
  };
};

async function listPitEntryDocsForEvent(
  eventKey: string
): Promise<RawEntryWithSetup[]> {
  const pitRefs = await getAdminDb()
    .collection("events")
    .doc(eventKey)
    .collection("pitEntries")
    .listDocuments();

  const entrySnapshots = await Promise.all(
    pitRefs.map((pitRef) => pitRef.collection("entries").get())
  );

  return entrySnapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      return doc.data() as RawEntryWithSetup;
    })
  );
}

export async function getProjectMatchCoverageSummary(
  projectId: string,
  eventKey: string
): Promise<ProjectMatchCoverageByMatch> {
  const coverage: ProjectMatchCoverageByMatch = {};
  const entries = await getAllMatchScoutingEntriesForEvent(eventKey);

  for (const data of entries as RawEntryWithSetup[]) {
    const setup = data.setup;

    if (
      setup?.kind !== "match" ||
      setup.projectId !== projectId ||
      typeof setup.matchNumber !== "number"
    ) {
      continue;
    }

    const current = coverage[setup.matchNumber] ?? {
      hasAnyData: false,
      positionsWithData: [],
    };

    const nextPositions =
      typeof setup.scoutingPosition === "string" &&
      !current.positionsWithData.includes(setup.scoutingPosition)
        ? [...current.positionsWithData, setup.scoutingPosition]
        : current.positionsWithData;

    coverage[setup.matchNumber] = {
      hasAnyData: true,
      positionsWithData: nextPositions,
    };
  }

  return coverage;
}

export async function projectHasMatchScoutingData(
  projectId: string,
  eventKey: string
): Promise<boolean> {
  const entries = await getAllMatchScoutingEntriesForEvent(eventKey);

  return entries.some((entry) => {
    const setup = (entry as RawEntryWithSetup).setup;
    return setup?.kind === "match" && setup.projectId === projectId;
  });
}

export async function projectHasPitScoutingData(
  projectId: string,
  eventKey: string
): Promise<boolean> {
  const entries = await listPitEntryDocsForEvent(eventKey);

  return entries.some((entry) => {
    const setup = entry.setup;
    return setup?.kind === "pit" && setup.projectId === projectId;
  });
}
