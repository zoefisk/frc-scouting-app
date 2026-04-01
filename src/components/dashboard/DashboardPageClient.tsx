"use client";

import React from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import CoverageWarningsCard from "@/components/dashboard/CoverageWarningsCard";
import MatchCoverageTable from "@/components/dashboard/MatchCoverageTable";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

import { useSyncMode } from "@/components/providers/SyncModeProvider";
import {buildCoverageWarnings, MatchCoverageWarning} from "@/lib/analysis/dashboard/buildCoverageWarnings";
import {getAppSetting, getScannedEntries, getSubmissions} from "@/lib/db";
import {getAllMatchScoutingEntriesForEvent} from "@/lib/firebase/server/entries";

type RawTbaMatch = {
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
};

type EventQualificationMatch = {
    matchKey: string;
    matchNumber: number;
    blueTeams: number[];
    redTeams: number[];
};

const ALLIANCE_PICKER_EVENT_KEY = "alliancePickerEventKey";
const FALLBACK_EVENT_KEY = "2026cthar";

function teamKeyToNumber(teamKey: string): number {
    return Number(teamKey.replace("frc", ""));
}

function buildQualificationMatches(matches: RawTbaMatch[]): EventQualificationMatch[] {
    return matches
        .filter((match) => match.comp_level === "qm")
        .sort((a, b) => a.match_number - b.match_number)
        .map((match) => ({
            matchKey: match.key,
            matchNumber: match.match_number,
            blueTeams: match.alliances.blue.team_keys.map(teamKeyToNumber),
            redTeams: match.alliances.red.team_keys.map(teamKeyToNumber),
        }));
}

export default function DashboardPageClient() {
    const { effectiveOnline } = useSyncMode();

    const [eventKey, setEventKey] = React.useState<string>(FALLBACK_EVENT_KEY);
    const [currentMatch, setCurrentMatch] = React.useState<number | null>(null);
    const [warnings, setWarnings] = React.useState<MatchCoverageWarning[]>([]);

    const [pendingSubmissionCount, setPendingSubmissionCount] = React.useState(0);
    const [scannedEntryCount, setScannedEntryCount] = React.useState(0);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        async function loadDashboard() {
            setLoading(true);
            setError("");

            try {
                const savedEventKey =
                    (await getAppSetting<string | null>(ALLIANCE_PICKER_EVENT_KEY)) ??
                    FALLBACK_EVENT_KEY;

                const resolvedEventKey =
                    typeof savedEventKey === "string" && savedEventKey.trim() !== ""
                        ? savedEventKey
                        : FALLBACK_EVENT_KEY;

                setEventKey(resolvedEventKey);

                const [pendingSubmissions, scannedEntries, matchesRes, entries] =
                    await Promise.all([
                        getSubmissions(),
                        getScannedEntries(),
                        fetch(`/api/tba/event-matches/${resolvedEventKey}`),
                        getAllMatchScoutingEntriesForEvent(resolvedEventKey),
                    ]);

                setPendingSubmissionCount(pendingSubmissions.length);
                setScannedEntryCount(scannedEntries.length);

                if (!matchesRes.ok) {
                    throw new Error("Could not load event matches.");
                }

                const rawMatches = (await matchesRes.json()) as RawTbaMatch[];
                const qualificationMatches = buildQualificationMatches(rawMatches);
                const nextWarnings = buildCoverageWarnings(qualificationMatches, entries);

                setWarnings(nextWarnings);

                const incomplete = nextWarnings.filter((warning) => !warning.isComplete);
                const nextCurrentMatch =
                    incomplete.length > 0
                        ? incomplete[0].matchNumber
                        : nextWarnings.length > 0
                            ? nextWarnings[nextWarnings.length - 1].matchNumber
                            : null;

                setCurrentMatch(nextCurrentMatch);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
                setError("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <Stack alignItems="center" sx={{ py: 8 }}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Scouting Dashboard
                </Typography>
                <Typography color="text.secondary">
                    Monitor coverage, sync state, and workflow status for {eventKey}.
                </Typography>
            </Box>

            {error && <Alert severity="warning">{error}</Alert>}

            <DashboardSummaryCards
                eventKey={eventKey}
                currentMatch={currentMatch}
                effectiveOnline={effectiveOnline}
                pendingSubmissionCount={pendingSubmissionCount}
                scannedEntryCount={scannedEntryCount}
            />

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <CoverageWarningsCard warnings={warnings} />
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <DashboardQuickActions />
                </Grid>
            </Grid>

            <MatchCoverageTable warnings={warnings} />
        </Stack>
    );
}
