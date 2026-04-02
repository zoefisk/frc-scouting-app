"use client";

import React from "react";
import { useEventTeams } from "@/old-lib/scouting/hooks/useEventTeams";
import { useAutofillTeam } from "@/old-lib/scouting/hooks/useAutofillTeam";
import { DEFAULT_EVENT_KEY } from "@/old-lib/scouting/constants";
import { ScoutingPosition, TeamData } from "@/old-lib/scouting/types";

type UseScoutingSetupFormResult = {
  eventKey: string;
  matchNumber: string;
  setMatchNumber: React.Dispatch<React.SetStateAction<string>>;
  scoutingPosition: ScoutingPosition | null;
  setScoutingPosition: React.Dispatch<
    React.SetStateAction<ScoutingPosition | null>
  >;
  eventTeams: TeamData[];
  teamsLoading: boolean;
  teamsError: string;
  selectedTeamKey: string | null;
  lookupLoading: boolean;
  lookupError: string;
  isAutofilled: boolean;
  usingCachedMatches: boolean;
  handleTeamChange: (team: TeamData | null) => void;
};

export function useScoutingSetupForm(): UseScoutingSetupFormResult {
  const eventKey = DEFAULT_EVENT_KEY;

  const [matchNumber, setMatchNumber] = React.useState("");
  const [scoutingPosition, setScoutingPosition] =
    React.useState<ScoutingPosition | null>(null);

  const { eventTeams, teamsLoading, teamsError } = useEventTeams(eventKey);

  const {
    selectedTeamKey,
    setSelectedTeamKey,
    lookupLoading,
    lookupError,
    isAutofilled,
    setIsAutofilled,
    usingCachedMatches,
  } = useAutofillTeam({
    eventKey,
    matchNumber,
    scoutingPosition,
    eventTeams,
  });

  const handleTeamChange = React.useCallback(
    (team: TeamData | null) => {
      setSelectedTeamKey(team?.key ?? null);
      setIsAutofilled(false);
    },
    [setSelectedTeamKey, setIsAutofilled]
  );

  return {
    eventKey,
    matchNumber,
    setMatchNumber,
    scoutingPosition,
    setScoutingPosition,
    eventTeams,
    teamsLoading,
    teamsError,
    selectedTeamKey,
    lookupLoading,
    lookupError,
    isAutofilled,
    usingCachedMatches,
    handleTeamChange,
  };
}
