"use client";

import React from "react";
import TeamRadarCard from "@/components/analysis/team/TeamRadarCard";
import TeamRadarComparePicker, {
  TeamOption,
} from "@/components/analysis/team/TeamRadarComparePicker";
import { useTeamRadarComparison } from "@/lib/hooks/useTeamRadarComparison";
import { TeamRadarSummary } from "@/lib/analysis/team/buildTeamRadarMetrics";

type Props = {
  eventKey: string;
  baseTeam: {
    key: string;
    teamNumber: number;
    nickname: string;
  };
  baseSummary: TeamRadarSummary;
  teamOptions: TeamOption[];
};

export default function TeamRadarCompareContainer({
  eventKey,
  baseTeam,
  baseSummary,
  teamOptions,
}: Props) {
  const {
    selectedCompareTeam,
    setSelectedCompareTeam,
    loading,
    error,
    series,
  } = useTeamRadarComparison({
    eventKey,
    baseTeam,
    baseSummary,
  });

  return (
    <TeamRadarCard
      sampleSize={baseSummary.sampleSize}
      series={series}
      loading={loading}
      error={error}
      picker={
        <TeamRadarComparePicker
          options={teamOptions}
          value={selectedCompareTeam}
          onChange={setSelectedCompareTeam}
          disabled={loading}
          excludeTeamKey={baseTeam.key}
        />
      }
    />
  );
}
