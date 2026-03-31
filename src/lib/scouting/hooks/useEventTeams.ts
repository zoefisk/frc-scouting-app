"use client";

import React from "react";
import { TeamData } from "../types";
import { getEventTeams, saveEventTeams } from "@/lib/db/indexDb";

export function useEventTeams(eventKey: string) {
    const [eventTeams, setEventTeams] = React.useState<TeamData[]>([]);
    const [teamsLoading, setTeamsLoading] = React.useState(false);
    const [teamsError, setTeamsError] = React.useState("");
    const [usingCachedTeams, setUsingCachedTeams] = React.useState(false);

    React.useEffect(() => {
        async function loadEventTeams() {
            setTeamsLoading(true);
            setTeamsError("");
            setUsingCachedTeams(false);

            try {
                let teams: TeamData[] | undefined;

                if (typeof window !== "undefined" && navigator.onLine) {
                    try {
                        const res = await fetch(`/api/tba/event-teams/${eventKey}`);
                        if (!res.ok) {
                            throw new Error("Could not load live event teams.");
                        }

                        const liveTeams: TeamData[] = await res.json();
                        teams = [...liveTeams].sort((a, b) => a.team_number - b.team_number);

                        await saveEventTeams(eventKey, teams);
                    } catch (liveError) {
                        console.error("Live team fetch failed, trying cache:", liveError);
                    }
                }

                if (!teams) {
                    const cachedTeams = await getEventTeams<TeamData[]>(eventKey);

                    if (!cachedTeams || cachedTeams.length === 0) {
                        throw new Error("No cached event teams available.");
                    }

                    teams = [...cachedTeams].sort((a, b) => a.team_number - b.team_number);
                    setUsingCachedTeams(true);
                }

                setEventTeams(teams);
            } catch (error) {
                console.error(error);
                setTeamsError("Could not load the team list for this event.");
            } finally {
                setTeamsLoading(false);
            }
        }

        loadEventTeams();
    }, [eventKey]);

    return { eventTeams, teamsLoading, teamsError, usingCachedTeams };
}
