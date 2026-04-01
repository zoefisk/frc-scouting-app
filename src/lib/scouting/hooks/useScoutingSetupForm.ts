"use client";

import React from "react";
import { DEFAULT_EVENT_KEY } from "@/lib/scouting/constants";
import { ScoutingPosition, TeamData } from "@/lib/scouting/types";
import { useEventTeams } from "@/lib/scouting/hooks/useEventTeams";
import { useAutofillTeam } from "@/lib/scouting/hooks/useAutofillTeam";

export function useScoutingSetupForm() {
    const [matchNumber, setMatchNumber] = React.useState("");
    const [scoutingPosition, setScoutingPosition] = React.useState<ScoutingPosition>("");

    const { eventTeams, teamsLoading, teamsError, usingCachedTeams } =
        useEventTeams(DEFAULT_EVENT_KEY);

    const {
        selectedTeamKey,
        setSelectedTeamKey,
        lookupLoading,
        lookupError,
        isAutofilled,
        setIsAutofilled,
        usingCachedMatches,
    } = useAutofillTeam({
        eventKey: DEFAULT_EVENT_KEY,
        matchNumber,
        scoutingPosition,
        eventTeams,
    });

    const handleTeamChange = React.useCallback(
        (team: TeamData | null) => {
            if (!team) {
                setSelectedTeamKey("");
                setIsAutofilled(false);
                return;
            }

            setSelectedTeamKey(team.key);
            setIsAutofilled(false);
        },
        [setSelectedTeamKey, setIsAutofilled]
    );

    return {
        eventKey: DEFAULT_EVENT_KEY,
        matchNumber,
        setMatchNumber,
        scoutingPosition,
        setScoutingPosition,
        eventTeams,
        teamsLoading,
        teamsError,
        usingCachedTeams,
        selectedTeamKey,
        lookupLoading,
        lookupError,
        isAutofilled,
        usingCachedMatches,
        handleTeamChange,
    };
}
