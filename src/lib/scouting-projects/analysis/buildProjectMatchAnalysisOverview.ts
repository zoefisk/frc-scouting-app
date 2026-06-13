import "server-only";

import {
  getProjectMatchQuestionnaireEntriesForMatch,
  type QuestionnaireEntryDoc,
} from "@/lib/firebase/server/entries";
import {
  buildQuestionnaireRawTable,
  type ProjectRawTable,
} from "@/lib/scouting-projects/analysis/rawTables";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";
import {
  getScheduleSlotsForMode,
  isTbaMatchPlayed,
} from "@/lib/scouting-projects/schedule";
import { slotHasRecordedData } from "@/lib/scouting-projects/matchCoverage";
import {
  hasMatchData,
  type ScoutingProjectDoc,
  type ScoutingScheduleSlot,
} from "@/lib/scouting-projects/types";
import {
  getEvent,
  getEventMatches,
  getEventRankings,
  getEventTeamsSimple,
} from "@/lib/scouting/tba/service";
import type {
  RawTbaMatch,
  RawTbaRankingRow,
  RawTbaTeam,
} from "@/lib/scouting/tba/types";

export type ProjectMatchAnalysisTeam = {
  teamKey: string;
  teamNumber: number;
  teamName: string;
  rank: number | null;
  allianceColor: "red" | "blue";
};

export type ProjectMatchMissingScouting = {
  missingSlots: ScoutingScheduleSlot[];
};

export type ProjectMatchAnalysisOverview = {
  matchNumber: number;
  eventName: string;
  title: string;
  subtitle: string;
  generalInfo: Array<{
    label: string;
    value: string;
  }>;
  eventInfo: Array<{
    label: string;
    value: string;
  }>;
  youtubeUrl: string | null;
  redScore: number | null;
  blueScore: number | null;
  teamCount: number;
  redTeams: ProjectMatchAnalysisTeam[];
  blueTeams: ProjectMatchAnalysisTeam[];
  matchRawTable: ProjectRawTable | null;
  missingScouting: ProjectMatchMissingScouting;
  hasMatchQuestionnaire: boolean;
};

function teamKeyToNumber(teamKey: string): number {
  return Number(teamKey.replace("frc", ""));
}

function formatUnixTime(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  return new Date(value * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMatchResultLabel(match: RawTbaMatch): string {
  if (!isTbaMatchPlayed(match)) {
    return "Upcoming";
  }

  if (match.winning_alliance === "red") {
    return "Red won";
  }

  if (match.winning_alliance === "blue") {
    return "Blue won";
  }

  return "Tie";
}

function buildTeamMap(teams: RawTbaTeam[]) {
  return new Map(teams.map((team) => [team.key, team]));
}

function buildRankingMap(rankings: RawTbaRankingRow[] | undefined) {
  return new Map(
    (rankings ?? [])
      .filter(
        (row): row is RawTbaRankingRow & { team_key: string } =>
          typeof row.team_key === "string"
      )
      .map((row) => [row.team_key, row.rank ?? null])
  );
}

function buildAllianceTeams(
  teamKeys: string[],
  allianceColor: "red" | "blue",
  teamMap: Map<string, RawTbaTeam>,
  rankMap: Map<string, number | null>
): ProjectMatchAnalysisTeam[] {
  return teamKeys.map((teamKey) => {
    const team = teamMap.get(teamKey);

    return {
      teamKey,
      teamNumber: team?.team_number ?? teamKeyToNumber(teamKey),
      teamName: team?.nickname ?? team?.name ?? teamKey,
      rank: rankMap.get(teamKey) ?? null,
      allianceColor,
    };
  });
}

function buildMissingScouting(
  project: ScoutingProjectDoc,
  entries: QuestionnaireEntryDoc[]
): ProjectMatchMissingScouting {
  if (!hasMatchData(project.dataMode) || !project.matchCollectionMode) {
    return { missingSlots: [] };
  }

  const positionsWithData = entries
    .map((entry) => entry.setup?.scoutingPosition ?? entry.scoutingPosition)
    .filter((value): value is string => typeof value === "string");

  const missingSlots = getScheduleSlotsForMode(
    project.matchCollectionMode
  ).filter((slot) => !slotHasRecordedData(slot, positionsWithData));

  return { missingSlots };
}

export async function buildProjectMatchAnalysisOverview(
  project: ScoutingProjectDoc & { id: string },
  matchNumber: number
): Promise<ProjectMatchAnalysisOverview | null> {
  const [
    event,
    matches,
    teams,
    rankingsResponse,
    matchEntries,
    matchQuestionnaire,
  ] = await Promise.all([
    getEvent(project.eventKey),
    getEventMatches(project.eventKey),
    getEventTeamsSimple(project.eventKey),
    getEventRankings(project.eventKey),
    getProjectMatchQuestionnaireEntriesForMatch(
      project.id,
      project.eventKey,
      matchNumber
    ),
    resolveProjectQuestionnaireServer(project.activeQuestionnaireIds?.match),
  ]);

  const match = matches.find(
    (entry) => entry.comp_level === "qm" && entry.match_number === matchNumber
  );

  if (!match) {
    return null;
  }

  const teamMap = buildTeamMap(teams);
  const rankMap = buildRankingMap(rankingsResponse.rankings);
  const redTeams = buildAllianceTeams(
    match.alliances.red.team_keys,
    "red",
    teamMap,
    rankMap
  );
  const blueTeams = buildAllianceTeams(
    match.alliances.blue.team_keys,
    "blue",
    teamMap,
    rankMap
  );
  const youtubeVideo = match.videos?.find((video) => video.type === "youtube");
  const youtubeUrl = youtubeVideo
    ? `https://www.youtube.com/watch?v=${youtubeVideo.key}`
    : null;
  const redScore =
    typeof match.alliances.red.score === "number" &&
    match.alliances.red.score >= 0
      ? match.alliances.red.score
      : null;
  const blueScore =
    typeof match.alliances.blue.score === "number" &&
    match.alliances.blue.score >= 0
      ? match.alliances.blue.score
      : null;
  const missingScouting = buildMissingScouting(project, matchEntries);

  const matchRawTable = buildQuestionnaireRawTable({
    title: "Match Scouting Responses",
    description: "All scouting entries saved for this qualification match.",
    questionnaire: matchQuestionnaire,
    entries: matchEntries,
    kind: "match",
    extraColumns: [
      { field: "teamNumber", headerName: "Team" },
      { field: "teamName", headerName: "Team Name" },
      { field: "scoutingPosition", headerName: "Pos" },
      { field: "teamPresence", headerName: "Present" },
    ],
    getBaseRowValues: (entry, index) => ({
      id:
        entry.entryId ??
        entry.submissionId ??
        `match-${matchNumber}-${entry.teamKey ?? index}-${index}`,
      savedAt:
        entry.savedAt != null
          ? new Date(entry.savedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "-",
      teamNumber: entry.teamNumber ?? entry.setup?.teamNumber ?? null,
      teamName: entry.teamName ?? entry.setup?.teamName ?? null,
      scoutingPosition:
        entry.scoutingPosition ?? entry.setup?.scoutingPosition ?? null,
      teamPresence: entry.teamPresence ?? entry.setup?.teamPresence ?? null,
    }),
  });

  return {
    matchNumber,
    eventName: event.name,
    title: `Qualification Match ${matchNumber}`,
    subtitle: `${project.name} at ${event.name}`,
    generalInfo: [
      { label: "Project", value: project.name },
      { label: "Event", value: event.name },
      { label: "Result", value: getMatchResultLabel(match) },
      {
        label: "Scheduled",
        value: formatUnixTime(
          match.actual_time ?? match.predicted_time ?? match.time ?? null
        ),
      },
    ],
    eventInfo: [
      {
        label: "Red Score",
        value: redScore !== null ? String(redScore) : "-",
      },
      {
        label: "Blue Score",
        value: blueScore !== null ? String(blueScore) : "-",
      },
      {
        label: "Scouted Entries",
        value: String(matchEntries.length),
      },
    ],
    youtubeUrl,
    redScore,
    blueScore,
    teamCount: teams.length,
    redTeams,
    blueTeams,
    matchRawTable,
    missingScouting,
    hasMatchQuestionnaire: Boolean(matchQuestionnaire),
  };
}
