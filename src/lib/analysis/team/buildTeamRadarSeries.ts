import { TeamRadarSummary } from "@/lib/analysis/team/buildTeamRadarMetrics";
import { TeamRadarSeries } from "@/components/analysis/team/TeamRadarChart";

type BaseTeam = {
  key: string;
  teamNumber: number;
  nickname: string;
};

type CompareTeamResponse = {
  team: {
    key: string;
    teamNumber: number;
    nickname: string;
    rank: number | null;
  };
  summary: TeamRadarSummary;
};

export function buildTeamRadarSeries(
  baseTeam: BaseTeam,
  baseSummary: TeamRadarSummary,
  compareSummary: CompareTeamResponse | null
): TeamRadarSeries[] {
  const series: TeamRadarSeries[] = [
    {
      label: `#${baseTeam.teamNumber} ${baseTeam.nickname || ""}`.trim(),
      summary: baseSummary,
    },
  ];

  if (compareSummary) {
    series.push({
      label:
        `#${compareSummary.team.teamNumber} ${compareSummary.team.nickname || ""}`.trim(),
      summary: compareSummary.summary,
    });
  }

  return series;
}
