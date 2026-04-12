import type {
  DocumentReference,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";
import { getAdminDb } from "@/lib/firebase/server/admin";
import { ProjectMatchCoverageByMatch } from "@/lib/scouting-projects/matchCoverage";

export type QuestionnaireEntryDoc = {
  entryId?: string | null;
  submissionId?: string | null;
  projectId?: string | null;
  eventKey?: string | null;
  matchNumber?: number | null;
  scoutingPosition?: string | null;
  teamPresence?: string | null;
  teamKey?: string | null;
  teamNumber?: number | null;
  teamName?: string | null;
  selectedTeamKey?: string | null;
  questionnaire?: {
    id?: string | null;
    name?: string | null;
    version?: number | null;
  };
  answers?: Record<string, unknown>;
  savedAt?: string | null;
  setup?: {
    kind?: string | null;
    projectId?: string | null;
    eventKey?: string | null;
    matchNumber?: number | null;
    scoutingPosition?: string | null;
    teamPresence?: string | null;
    teamKey?: string | null;
    teamNumber?: number | null;
    teamName?: string | null;
  };
};

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
): Promise<QuestionnaireEntryDoc[]> {
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
      return doc.data() as QuestionnaireEntryDoc;
    })
  );
}

async function deleteDocumentRefsInBatches(
  refs: DocumentReference[]
): Promise<void> {
  if (refs.length === 0) {
    return;
  }

  const db = getAdminDb();
  let batch = db.batch();
  let operationCount = 0;

  for (const ref of refs) {
    batch.delete(ref);
    operationCount += 1;

    if (operationCount === 400) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
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

export async function getProjectPitCoverageSummary(
  projectId: string,
  eventKey: string
): Promise<Record<string, boolean>> {
  const entries = await listPitEntryDocsForEvent(eventKey);
  const coverage: Record<string, boolean> = {};

  for (const entry of entries) {
    const setup = entry.setup;

    if (setup?.kind !== "pit" || setup.projectId !== projectId) {
      continue;
    }

    const teamKey = setup.teamKey ?? entry.teamKey ?? entry.selectedTeamKey;
    if (!teamKey) {
      continue;
    }

    coverage[teamKey] = true;
  }

  return coverage;
}

export async function getProjectTeamMatchQuestionnaireEntries(
  projectId: string,
  eventKey: string,
  teamKey: string
): Promise<QuestionnaireEntryDoc[]> {
  const entries = await getAllMatchScoutingEntriesForEvent(eventKey);

  return (entries as QuestionnaireEntryDoc[])
    .filter((entry) => {
      const setup = entry.setup;
      return (
        setup?.kind === "match" &&
        setup.projectId === projectId &&
        setup.teamKey === teamKey
      );
    })
    .sort((a, b) => {
      const matchDiff = (a.matchNumber ?? 0) - (b.matchNumber ?? 0);
      if (matchDiff !== 0) {
        return matchDiff;
      }

      return String(a.savedAt ?? "").localeCompare(String(b.savedAt ?? ""));
    });
}

export async function getProjectTeamPitQuestionnaireEntries(
  projectId: string,
  eventKey: string,
  teamKey: string
): Promise<QuestionnaireEntryDoc[]> {
  const entries = await listPitEntryDocsForEvent(eventKey);

  return entries
    .filter((entry) => {
      const setup = entry.setup;
      return (
        setup?.kind === "pit" &&
        setup.projectId === projectId &&
        setup.teamKey === teamKey
      );
    })
    .sort((a, b) =>
      String(b.savedAt ?? "").localeCompare(String(a.savedAt ?? ""))
    );
}

export async function deleteProjectMatchScoutingEntries(
  projectId: string,
  eventKey: string
): Promise<void> {
  const matchRefs = await getAdminDb()
    .collection("events")
    .doc(eventKey)
    .collection("matches")
    .listDocuments();

  const refsToDelete: DocumentReference[] = [];

  for (const matchRef of matchRefs) {
    const snapshot = await matchRef.collection("entries").get();
    const matchingEntryRefs = snapshot.docs
      .filter((doc) => {
        const setup = (doc.data() as RawEntryWithSetup).setup;
        return setup?.kind === "match" && setup.projectId === projectId;
      })
      .map((doc) => doc.ref);

    refsToDelete.push(...matchingEntryRefs);

    if (
      matchingEntryRefs.length > 0 &&
      matchingEntryRefs.length === snapshot.docs.length
    ) {
      refsToDelete.push(matchRef);
    }
  }

  await deleteDocumentRefsInBatches(refsToDelete);
}

export async function deleteProjectPitScoutingEntries(
  projectId: string,
  eventKey: string
): Promise<void> {
  const pitRefs = await getAdminDb()
    .collection("events")
    .doc(eventKey)
    .collection("pitEntries")
    .listDocuments();

  const refsToDelete: DocumentReference[] = [];

  for (const pitRef of pitRefs) {
    const snapshot = await pitRef.collection("entries").get();
    const matchingEntryRefs = snapshot.docs
      .filter((doc) => {
        const setup = (doc.data() as RawEntryWithSetup).setup;
        return setup?.kind === "pit" && setup.projectId === projectId;
      })
      .map((doc) => doc.ref);

    refsToDelete.push(...matchingEntryRefs);

    if (
      matchingEntryRefs.length > 0 &&
      matchingEntryRefs.length === snapshot.docs.length
    ) {
      refsToDelete.push(pitRef);
    }
  }

  await deleteDocumentRefsInBatches(refsToDelete);
}
