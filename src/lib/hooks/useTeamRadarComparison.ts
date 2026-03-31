"use client";

import React from "react";
import { TeamRadarSummary } from "@/lib/analysis/buildTeamRadarMetrics";
import { TeamOption } from "@/components/analysis/team/TeamRadarComparePicker";
import { buildTeamRadarSeries } from "@/lib/analysis/buildTeamRadarSeries";
import { TeamRadarSeries } from "@/components/analysis/team/TeamRadarChart";

type BaseTeam = {
    key: string;
    teamNumber: number;
    nickname: string;
};

type CompareApiResponse = {
    team: {
        key: string;
        teamNumber: number;
        nickname: string;
        rank: number | null;
    };
    summary: TeamRadarSummary;
};

type Args = {
    eventKey: string;
    baseTeam: BaseTeam;
    baseSummary: TeamRadarSummary;
};

export function useTeamRadarComparison({
                                           eventKey,
                                           baseTeam,
                                           baseSummary,
                                       }: Args) {
    const [selectedCompareTeam, setSelectedCompareTeam] =
        React.useState<TeamOption | null>(null);
    const [compareSummary, setCompareSummary] =
        React.useState<CompareApiResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        async function loadCompareSummary() {
            if (!selectedCompareTeam) {
                setCompareSummary(null);
                setError("");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `/api/analysis/${eventKey}/teams/${selectedCompareTeam.key}/radar`
                );

                if (!res.ok) {
                    throw new Error("Could not load comparison team data.");
                }

                const data = (await res.json()) as CompareApiResponse;
                setCompareSummary(data);
            } catch (err) {
                console.error(err);
                setCompareSummary(null);
                setError("Could not load comparison team radar.");
            } finally {
                setLoading(false);
            }
        }

        loadCompareSummary();
    }, [eventKey, selectedCompareTeam]);

    const series: TeamRadarSeries[] = React.useMemo(
        () => buildTeamRadarSeries(baseTeam, baseSummary, compareSummary),
        [baseTeam, baseSummary, compareSummary]
    );

    return {
        selectedCompareTeam,
        setSelectedCompareTeam,
        compareSummary,
        loading,
        error,
        series,
    };
}
