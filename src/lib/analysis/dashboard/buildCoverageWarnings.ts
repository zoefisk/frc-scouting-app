import { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";
import { EventQualificationMatch } from "@/lib/server/tba/types";

export type MatchCoverageWarning = {
  matchNumber: number;
  expectedTeams: number[];
  scoutedTeams: number[];
  missingTeams: number[];
  isComplete: boolean;
};

export function buildCoverageWarnings(
  matches: EventQualificationMatch[],
  entries: MatchScoutingEntryDoc[]
): MatchCoverageWarning[] {
  const presentEntries = entries.filter(
    (entry) => entry.teamPresence === "present"
  );

  const byMatch = new Map<number, Set<number>>();

  for (const entry of presentEntries) {
    if (
      typeof entry.matchNumber !== "number" ||
      typeof entry.teamNumber !== "number"
    ) {
      continue;
    }

    if (!byMatch.has(entry.matchNumber)) {
      byMatch.set(entry.matchNumber, new Set<number>());
    }

    byMatch.get(entry.matchNumber)!.add(entry.teamNumber);
  }

  return matches.map((match) => {
    const expectedTeams = [...match.blueTeams, ...match.redTeams];
    const scoutedSet = byMatch.get(match.matchNumber) ?? new Set<number>();
    const scoutedTeams = [...scoutedSet].sort((a, b) => a - b);
    const missingTeams = expectedTeams.filter((team) => !scoutedSet.has(team));

    return {
      matchNumber: match.matchNumber,
      expectedTeams,
      scoutedTeams,
      missingTeams,
      isComplete: missingTeams.length === 0,
    };
  });
}
