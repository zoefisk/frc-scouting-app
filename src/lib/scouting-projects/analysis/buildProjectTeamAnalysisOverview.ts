import "server-only";

import { TeamRadarSummary } from "@/lib/analysis/team/buildTeamRadarMetrics";
import {
  getProjectTeamMatchQuestionnaireEntries,
  getProjectTeamPitQuestionnaireEntries,
  type QuestionnaireEntryDoc,
} from "@/lib/firebase/server/entries";
import { PERF_FIELDS } from "@/lib/scouting/performanceRatings";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
import {
  buildQuestionnaireRawTable,
  type ProjectRawTable,
} from "@/lib/scouting-projects/analysis/rawTables";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";
import {
  hasMatchData,
  hasPitData,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";
import {
  getEvent,
  getEventRankings,
  getTeam,
  getTeamEventMatches,
  getTeamEventSummary,
} from "@/lib/scouting/tba/service";
import type { RawTbaRankingsResponse } from "@/lib/scouting/tba/types";

export type ProjectTeamPerformancePoint = {
  matchNumber: number;
  totalScore: number | null;
  result: "W" | "L" | "T";
  allianceColor: "red" | "blue";
};

export type ProjectTeamRadarSeries = {
  label: string;
  summary: TeamRadarSummary;
};

export type ProjectTeamMissingScouting = {
  missingMatchNumbers: number[];
  missingPit: boolean;
};

export type ProjectTeamAnalysisOverview = {
  teamKey: string;
  teamNumber: number;
  teamDisplayName: string;
  teamLongName: string;
  eventName: string;
  generalInfo: Array<{
    label: string;
    value: string;
  }>;
  eventInfo: Array<{
    label: string;
    value: string;
  }>;
  performancePoints: ProjectTeamPerformancePoint[];
  radarSeries: ProjectTeamRadarSeries[];
  radarSampleSize: number;
  matchRawTable: ProjectRawTable | null;
  pitRawTable: ProjectRawTable | null;
  missingScouting: ProjectTeamMissingScouting;
};

function teamKeyToNumber(teamKey: string): number {
  return Number(teamKey.replace("frc", ""));
}

function findSortOrderIndex(
  rankingsResponse: RawTbaRankingsResponse,
  patterns: string[]
): number {
  const sortOrderInfo = Array.isArray(rankingsResponse.sort_order_info)
    ? rankingsResponse.sort_order_info
    : [];

  return sortOrderInfo.findIndex((item) => {
    const name = String(item?.name ?? "").toLowerCase();
    return patterns.some((pattern) => name.includes(pattern));
  });
}

function formatSortOrderValue(
  sortOrders: number[] | undefined,
  index: number
): string {
  if (index < 0 || !Array.isArray(sortOrders)) {
    return "-";
  }

  const value = sortOrders[index];
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(2).replace(/\.00$/, "")
    : "-";
}

function buildRawTable(
  title: string,
  description: string,
  questionnaire: QuestionnaireDefinition | null,
  entries: QuestionnaireEntryDoc[],
  kind: "match" | "pit"
): ProjectRawTable | null {
  return buildQuestionnaireRawTable({
    title,
    description,
    questionnaire,
    entries,
    kind,
  });
}

function buildRadarSummaryFromEntries(
  entries: QuestionnaireEntryDoc[]
): TeamRadarSummary {
  const presentEntries = entries.filter((e) => e.teamPresence === "present");

  function avgForField(fieldId: string): number {
    const values = presentEntries
      .map((e) => e.answers?.[fieldId])
      .filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  return {
    sampleSize: presentEntries.length,
    metrics: PERF_FIELDS.map((field) => ({
      label: field.label,
      value: avgForField(field.id),
    })),
  };
}

export async function buildProjectTeamAnalysisOverview(
  project: ScoutingProjectDoc & { id: string },
  teamKey: string
): Promise<ProjectTeamAnalysisOverview> {
  const teamNumber = teamKeyToNumber(teamKey);
  const [
    team,
    event,
    summary,
    teamMatches,
    rankingsResponse,
    matchEntries,
    pitEntries,
    matchQuestionnaire,
    pitQuestionnaire,
  ] = await Promise.all([
    getTeam(teamNumber),
    getEvent(project.eventKey),
    getTeamEventSummary(project.eventKey, teamKey),
    getTeamEventMatches(project.eventKey, teamKey),
    getEventRankings(project.eventKey),
    getProjectTeamMatchQuestionnaireEntries(
      project.id,
      project.eventKey,
      teamKey
    ),
    getProjectTeamPitQuestionnaireEntries(
      project.id,
      project.eventKey,
      teamKey
    ),
    resolveProjectQuestionnaireServer(project.activeQuestionnaireIds?.match),
    resolveProjectQuestionnaireServer(project.activeQuestionnaireIds?.pit),
  ]);

  const rankingRow = (rankingsResponse.rankings ?? []).find(
    (row) => row.team_key === teamKey
  );
  const avgMatchIndex = findSortOrderIndex(rankingsResponse, [
    "avg match",
    "average match",
  ]);
  const avgAutoFuelIndex = findSortOrderIndex(rankingsResponse, [
    "avg auto fuel",
    "auto fuel",
  ]);
  const avgTowerIndex = findSortOrderIndex(rankingsResponse, [
    "avg tower",
    "tower",
  ]);

  const playedMatches = teamMatches.filter((match) => match.blueScore >= 0);

  const performancePoints = playedMatches.map((match) => ({
    matchNumber: match.matchNumber,
    totalScore:
      match.allianceColor === "blue" ? match.blueScore : match.redScore,
    result: match.result,
    allianceColor: match.allianceColor,
  }));

  const playedMatchNumbers = new Set(playedMatches.map((m) => m.matchNumber));
  const scoutedMatchNumbers = new Set(
    matchEntries.map((e) => e.matchNumber).filter((n): n is number => n != null)
  );
  const missingScouting: ProjectTeamMissingScouting = {
    missingMatchNumbers: hasMatchData(project.dataMode)
      ? [...playedMatchNumbers]
          .filter((n) => !scoutedMatchNumbers.has(n))
          .sort((a, b) => a - b)
      : [],
    missingPit:
      hasPitData(project.dataMode) &&
      playedMatches.length > 0 &&
      pitEntries.length === 0,
  };

  const averageOfficialScore =
    performancePoints.length > 0
      ? (
          performancePoints.reduce(
            (sum, point) => sum + (point.totalScore ?? 0),
            0
          ) / performancePoints.length
        ).toFixed(1)
      : "-";

  const wins = rankingRow?.record?.wins ?? summary.wins;
  const losses = rankingRow?.record?.losses ?? summary.losses;
  const ties = rankingRow?.record?.ties ?? summary.ties;

  const teamDisplayName = `${team.team_number}`;
  const teamLongName = team.nickname ?? team.name ?? team.key;
  const radarSummary = buildRadarSummaryFromEntries(matchEntries);

  return {
    teamKey,
    teamNumber,
    teamDisplayName,
    teamLongName,
    eventName: event.name,
    generalInfo: [
      { label: "Team", value: `#${team.team_number}` },
      { label: "Nickname", value: team.nickname ?? "-" },
      { label: "Project", value: project.name },
      { label: "Event", value: event.name },
    ],
    eventInfo: [
      {
        label: "Rank",
        value:
          typeof rankingRow?.rank === "number" ? `#${rankingRow.rank}` : "-",
      },
      { label: "Record", value: `${wins}-${losses}-${ties}` },
      { label: "Matches Played", value: String(summary.totalMatches) },
      {
        label: "Avg Match",
        value: formatSortOrderValue(rankingRow?.sort_orders, avgMatchIndex),
      },
      {
        label: "Avg Auto Fuel",
        value: formatSortOrderValue(rankingRow?.sort_orders, avgAutoFuelIndex),
      },
      {
        label: "Avg Tower",
        value: formatSortOrderValue(rankingRow?.sort_orders, avgTowerIndex),
      },
      { label: "Avg Official Score", value: String(averageOfficialScore) },
      { label: "Project Match Entries", value: String(matchEntries.length) },
      { label: "Project Pit Entries", value: String(pitEntries.length) },
    ],
    performancePoints,
    radarSeries: [
      {
        label: "Current Snapshot",
        summary: radarSummary,
      },
    ],
    radarSampleSize: radarSummary.sampleSize,
    matchRawTable: hasMatchData(project.dataMode)
      ? buildRawTable(
          "Match Scouting Raw Data",
          "Project-scoped raw match scouting responses for this team.",
          matchQuestionnaire,
          matchEntries,
          "match"
        )
      : null,
    pitRawTable: hasPitData(project.dataMode)
      ? buildRawTable(
          "Pit Scouting Raw Data",
          "Project-scoped raw pit scouting responses for this team.",
          pitQuestionnaire,
          pitEntries,
          "pit"
        )
      : null,
    missingScouting,
  };
}
