"use client";

import React from "react";
import { getEventMatches } from "@/old-lib/db";
import { ScoutingPosition } from "@/old-lib/scouting/types";

type TeamData = {
  key: string;
  team_number: number;
  nickname?: string;
};

type MatchAlliance = {
  team_keys: string[];
};

type MatchData = {
  key: string;
  comp_level: string;
  match_number: number;
  alliances: {
    blue: MatchAlliance;
    red: MatchAlliance;
  };
};

type Args = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  eventTeams: TeamData[];
};

type Result = {
  selectedTeamKey: string | null;
  setSelectedTeamKey: React.Dispatch<React.SetStateAction<string | null>>;
  lookupLoading: boolean;
  lookupError: string;
  isAutofilled: boolean;
  setIsAutofilled: React.Dispatch<React.SetStateAction<boolean>>;
  usingCachedMatches: boolean;
};

function getAllianceAndIndex(position: ScoutingPosition) {
  if (position.startsWith("blue")) {
    return {
      alliance: "blue" as const,
      index: Number(position.replace("blue", "")) - 1,
    };
  }

  return {
    alliance: "red" as const,
    index: Number(position.replace("red", "")) - 1,
  };
}

export function useAutofillTeam({
  eventKey,
  matchNumber,
  scoutingPosition,
  eventTeams,
}: Args): Result {
  const [selectedTeamKey, setSelectedTeamKey] = React.useState<string | null>(
    null
  );
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupError, setLookupError] = React.useState("");
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const [usingCachedMatches, setUsingCachedMatches] = React.useState(false);

  React.useEffect(() => {
    async function autofillTeam() {
      if (
        !eventKey ||
        !matchNumber ||
        !scoutingPosition ||
        eventTeams.length === 0
      ) {
        return;
      }

      setLookupLoading(true);
      setLookupError("");
      setUsingCachedMatches(false);

      try {
        const cachedMatches = await getEventMatches<MatchData[]>(eventKey);

        if (!cachedMatches || cachedMatches.length === 0) {
          setLookupError("No cached match data available for this event.");
          return;
        }

        setUsingCachedMatches(true);

        const numericMatchNumber = Number(matchNumber);
        if (Number.isNaN(numericMatchNumber)) {
          setLookupError("Invalid match number.");
          return;
        }

        const targetMatch = cachedMatches.find(
          (match) =>
            match.comp_level === "qm" &&
            match.match_number === numericMatchNumber
        );

        if (!targetMatch) {
          setLookupError("Could not find that match in cached event data.");
          return;
        }

        const { alliance, index } = getAllianceAndIndex(scoutingPosition);
        const allianceTeams = targetMatch.alliances[alliance]?.team_keys ?? [];
        const teamKey = allianceTeams[index] ?? null;

        if (!teamKey) {
          setLookupError(
            "Could not determine a team for that scouting position."
          );
          return;
        }

        const teamExists = eventTeams.some((team) => team.key === teamKey);
        if (!teamExists) {
          setLookupError(
            "Autofilled team was not found in the event team list."
          );
          return;
        }

        setSelectedTeamKey(teamKey);
        setIsAutofilled(true);
      } catch (error) {
        setLookupError("Failed to autofill team.");
      } finally {
        setLookupLoading(false);
      }
    }

    autofillTeam();
  }, [eventKey, matchNumber, scoutingPosition, eventTeams]);

  return {
    selectedTeamKey,
    setSelectedTeamKey,
    lookupLoading,
    lookupError,
    isAutofilled,
    setIsAutofilled,
    usingCachedMatches,
  };
}
