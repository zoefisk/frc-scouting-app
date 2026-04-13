import "server-only";

import { TeamRadarSummary } from "@/lib/analysis/team/buildTeamRadarMetrics";
import {
  getProjectTeamMatchQuestionnaireEntries,
  getProjectTeamPitQuestionnaireEntries,
  type QuestionnaireEntryDoc,
} from "@/lib/firebase/server/entries";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
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

export type ProjectTeamRawTableColumn = {
  field: string;
  headerName: string;
};

export type ProjectTeamRawTableRow = Record<string, string | number | null> & {
  id: string;
};

export type ProjectTeamRawTable = {
  title: string;
  description: string;
  columns: ProjectTeamRawTableColumn[];
  rows: ProjectTeamRawTableRow[];
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
  matchRawTable: ProjectTeamRawTable | null;
  pitRawTable: ProjectTeamRawTable | null;
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

function formatSavedAt(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAnswerValue(value: unknown): string | number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return JSON.stringify(value);
}

function buildRawTable(
  title: string,
  description: string,
  questionnaire: QuestionnaireDefinition | null,
  entries: QuestionnaireEntryDoc[],
  kind: "match" | "pit"
): ProjectTeamRawTable | null {
  if (!questionnaire) {
    return null;
  }

  const columns: ProjectTeamRawTableColumn[] = [
    { field: "savedAt", headerName: "Saved" },
  ];

  if (kind === "match") {
    columns.push(
      { field: "matchNumber", headerName: "Match" },
      { field: "scoutingPosition", headerName: "Pos" },
      { field: "teamPresence", headerName: "Present" }
    );
  }

  for (const section of questionnaire.sections) {
    for (const field of section.fields) {
      columns.push({
        field: field.id,
        headerName: field.label,
      });
    }
  }

  const rows = entries.map((entry, index) => {
    const baseRow: ProjectTeamRawTableRow = {
      id:
        entry.entryId ??
        entry.submissionId ??
        `${kind}-${entry.matchNumber ?? "pit"}-${index}`,
      savedAt: formatSavedAt(entry.savedAt),
      matchNumber: entry.matchNumber ?? null,
      scoutingPosition: entry.scoutingPosition ?? null,
      teamPresence: entry.teamPresence ?? null,
    };

    for (const section of questionnaire.sections) {
      for (const field of section.fields) {
        baseRow[field.id] = formatAnswerValue(entry.answers?.[field.id]);
      }
    }

    return baseRow;
  });

  return {
    title,
    description,
    columns,
    rows,
  };
}

function buildPlaceholderRadarSummary(teamNumber: number): TeamRadarSummary {
  const seed = String(teamNumber)
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (index + 3), 11);

  const metricValue = (offset: number) =>
    Math.min(5, Math.max(1, ((seed + offset * 7) % 21) / 5 + 1));

  return {
    sampleSize: 4,
    metrics: [
      { label: "Auto", value: Number(metricValue(1).toFixed(1)) },
      { label: "Teleop", value: Number(metricValue(2).toFixed(1)) },
      { label: "Defense", value: Number(metricValue(3).toFixed(1)) },
      { label: "Reliability", value: Number(metricValue(4).toFixed(1)) },
      { label: "Driver", value: Number(metricValue(5).toFixed(1)) },
      { label: "Endgame", value: Number(metricValue(6).toFixed(1)) },
    ],
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
  const radarSummary = buildPlaceholderRadarSummary(teamNumber);

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
