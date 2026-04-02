// src/lib/scouting/match/setupData.ts

import {
  getEventMatches as getCachedEventMatches,
  getEventTeams as getCachedEventTeams,
  saveEventMatches,
  saveEventTeams,
} from "@/lib/db/events";
import type { TeamOption } from "@/lib/server/client/loadEventTeams";

export type RawTbaMatch = {
  key: string;
  comp_level: string;
  match_number: number;
  alliances: {
    blue: {
      team_keys: string[];
      score: number;
    };
    red: {
      team_keys: string[];
      score: number;
    };
  };
  winning_alliance?: string;
  actual_time?: number | null;
  predicted_time?: number | null;
  time?: number | null;
};

export type ScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3";

type LoadResult<T> = {
  data: T;
  fromCache: boolean;
};

export async function loadEventTeamsForScouting(
  eventKey: string
): Promise<LoadResult<TeamOption[]>> {
  try {
    const res = await fetch(
      `/api/tba/event-teams/${encodeURIComponent(eventKey)}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch event teams.");
    }

    const teams = (await res.json()) as TeamOption[];
    await saveEventTeams(eventKey, teams);
    return { data: teams, fromCache: false };
  } catch {
    const cached = (await getCachedEventTeams<TeamOption[]>(eventKey)) ?? [];
    return { data: cached, fromCache: true };
  }
}

export async function loadEventMatchesForScouting(
  eventKey: string
): Promise<LoadResult<RawTbaMatch[]>> {
  try {
    const res = await fetch(
      `/api/tba/event-matches/${encodeURIComponent(eventKey)}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch event matches.");
    }

    const matches = (await res.json()) as RawTbaMatch[];
    await saveEventMatches(eventKey, matches);
    return { data: matches, fromCache: false };
  } catch {
    const cached = (await getCachedEventMatches<RawTbaMatch[]>(eventKey)) ?? [];
    return { data: cached, fromCache: true };
  }
}

export function getSuggestedTeamKeyForSetup(args: {
  matches: RawTbaMatch[];
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
}): string | null {
  const { matches, matchNumber, scoutingPosition } = args;

  if (!matchNumber || !scoutingPosition) {
    return null;
  }

  const parsedMatchNumber = Number(matchNumber);
  if (!Number.isFinite(parsedMatchNumber)) {
    return null;
  }

  const match = matches.find(
    (m) => m.comp_level === "qm" && m.match_number === parsedMatchNumber
  );

  if (!match) {
    return null;
  }

  const [alliance, slotText] = scoutingPosition.startsWith("blue")
    ? ["blue", scoutingPosition.replace("blue", "")]
    : ["red", scoutingPosition.replace("red", "")];

  const slotIndex = Number(slotText) - 1;
  if (slotIndex < 0 || slotIndex > 2) {
    return null;
  }

  const teamKeys =
    alliance === "blue"
      ? match.alliances.blue.team_keys
      : match.alliances.red.team_keys;

  return teamKeys[slotIndex] ?? null;
}

function isMatchPlayed(match: RawTbaMatch): boolean {
  // TBA commonly uses -1 scores for unplayed matches.
  const hasScores =
    match.alliances.blue.score !== -1 && match.alliances.red.score !== -1;

  const hasWinner =
    typeof match.winning_alliance === "string" &&
    match.winning_alliance.length > 0;

  const hasActualTime =
    typeof match.actual_time === "number" && match.actual_time > 0;

  return hasScores || hasWinner || hasActualTime;
}

export function getSuggestedCurrentMatchNumber(
  matches: RawTbaMatch[]
): number | null {
  const qmMatches = matches
    .filter((m) => m.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number);

  if (qmMatches.length === 0) {
    return null;
  }

  const nextUnplayed = qmMatches.find((match) => !isMatchPlayed(match));
  if (nextUnplayed) {
    return nextUnplayed.match_number;
  }

  return qmMatches[qmMatches.length - 1]?.match_number ?? null;
}
