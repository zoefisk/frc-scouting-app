"use client";

import React from "react";

type TbaMatch = {
  comp_level: string;
  match_number: number;
  alliances: {
    blue: { score: number };
    red: { score: number };
  };
};

function getNextQualificationMatch(matches: TbaMatch[]): number | null {
  const qualificationMatches = matches
    .filter((m) => m.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number);

  const nextUnplayed = qualificationMatches.find(
    (m) => m.alliances.blue.score === -1 && m.alliances.red.score === -1
  );

  if (nextUnplayed) return nextUnplayed.match_number;

  if (qualificationMatches.length > 0) {
    return qualificationMatches[qualificationMatches.length - 1].match_number;
  }

  return null;
}

export function useDetectedMatchNumber(eventKey: string) {
  const [detectedMatch, setDetectedMatch] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMatch = React.useCallback(async () => {
    if (!eventKey || !navigator.onLine) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tba/event-matches/${eventKey}`);
      if (!res.ok) throw new Error("Failed to fetch matches");

      const matches: TbaMatch[] = await res.json();
      const next = getNextQualificationMatch(matches);

      if (next == null) {
        throw new Error("No matches found");
      }

      setDetectedMatch(next);
    } catch {
      setError("Could not detect current match");
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  React.useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return {
    detectedMatch,
    loading,
    error,
    refetch: fetchMatch,
  };
}
