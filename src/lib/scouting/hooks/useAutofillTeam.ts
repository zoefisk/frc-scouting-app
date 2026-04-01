"use client";

import React from "react";
import { ScoutingPosition, TeamData, TbaMatch } from "@/lib/scouting/types";
import { getTeamNumberFromPosition } from "@/lib/scouting/utils";
import { getEventMatches, saveEventMatches } from "@/lib/db/events";

type Args = {
    eventKey: string;
    matchNumber: string;
    scoutingPosition: ScoutingPosition;
    eventTeams: TeamData[];
};

export function useAutofillTeam({ eventKey, matchNumber, scoutingPosition, eventTeams }: Args) {
    const [selectedTeamKey, setSelectedTeamKey] = React.useState("");
    const [lookupLoading, setLookupLoading] = React.useState(false);
    const [lookupError, setLookupError] = React.useState("");
    const [isAutofilled, setIsAutofilled] = React.useState(false);
    const [usingCachedMatches, setUsingCachedMatches] = React.useState(false);

    React.useEffect(() => {
        async function autofillTeam() {
            setLookupError("");
            setIsAutofilled(false);
            setUsingCachedMatches(false);

            if (!matchNumber || !scoutingPosition || eventTeams.length === 0) return;

            setLookupLoading(true);

            try {
                let matches: TbaMatch[] | undefined;

                if (navigator.onLine) {
                    try {
                        const matchesRes = await fetch(`/api/tba/event-matches/${eventKey}`);
                        if (!matchesRes.ok) {
                            throw new Error("Could not load live event matches.");
                        }

                        matches = await matchesRes.json();
                        await saveEventMatches(eventKey, matches);
                    } catch (liveError) {
                        console.error("Live match fetch failed, trying cache:", liveError);
                    }
                }

                if (!matches) {
                    const cachedMatches = await getEventMatches<TbaMatch[]>(eventKey);

                    if (!cachedMatches || cachedMatches.length === 0) {
                        throw new Error("No cached event matches available.");
                    }

                    matches = cachedMatches;
                    setUsingCachedMatches(true);
                }

                const targetMatch = matches.find(
                    (match) => match.comp_level === "qm" && match.match_number === Number(matchNumber)
                );

                if (!targetMatch) {
                    throw new Error("Could not find that qualification match.");
                }

                const derivedTeamNumber = getTeamNumberFromPosition(
                    targetMatch,
                    scoutingPosition as Exclude<ScoutingPosition, "">
                );

                if (!derivedTeamNumber) {
                    throw new Error("Could not determine team from position.");
                }

                const matchingTeam = eventTeams.find(
                    (team) => team.team_number === derivedTeamNumber
                );

                if (!matchingTeam) {
                    throw new Error("That team was not found in the event team list.");
                }

                setSelectedTeamKey(matchingTeam.key);
                setIsAutofilled(true);
            } catch (error) {
                console.error(error);
                setLookupError(
                    "Automatic lookup is unavailable right now. Select the team manually from the dropdown."
                );
                setIsAutofilled(false);
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
