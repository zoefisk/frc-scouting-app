import { getEventMatches, getEventRankings } from "@/lib/scouting/tba/service";
import type { RawTbaRankingsResponse } from "@/lib/scouting/tba/types";

export type ProjectQualificationResultRow = {
  id: string;
  matchNumber: number;
  videoUrl: string | null;
  red1: number | null;
  red2: number | null;
  red3: number | null;
  redScore: number | null;
  blueScore: number | null;
  blue1: number | null;
  blue2: number | null;
  blue3: number | null;
};

export type ProjectRankingRow = {
  id: string;
  rank: number | null;
  teamNumber: number | null;
  record: string;
  avgMatch: string;
  avgAutoFuel: string;
  avgTower: string;
};

export type ProjectAnalysisOverview = {
  qualificationRows: ProjectQualificationResultRow[];
  rankingRows: ProjectRankingRow[];
};

function teamKeyToNumber(teamKey: string | undefined): number | null {
  if (typeof teamKey !== "string") {
    return null;
  }

  const parsed = Number(teamKey.replace("frc", ""));
  return Number.isFinite(parsed) ? parsed : null;
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

export async function buildProjectAnalysisOverview(
  eventKey: string
): Promise<ProjectAnalysisOverview> {
  const [matches, rankingsResponse] = await Promise.all([
    getEventMatches(eventKey),
    getEventRankings(eventKey),
  ]);

  const qualificationRows = matches
    .filter((match) => match.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number)
    .map((match) => {
      const youtubeVideo = match.videos?.find(
        (video) => video.type === "youtube"
      );

      return {
        id: match.key,
        matchNumber: match.match_number,
        videoUrl: youtubeVideo
          ? `https://www.youtube.com/watch?v=${youtubeVideo.key}`
          : null,
        red1: teamKeyToNumber(match.alliances.red.team_keys[0]),
        red2: teamKeyToNumber(match.alliances.red.team_keys[1]),
        red3: teamKeyToNumber(match.alliances.red.team_keys[2]),
        redScore: Number.isFinite(match.alliances.red.score)
          ? match.alliances.red.score
          : null,
        blueScore: Number.isFinite(match.alliances.blue.score)
          ? match.alliances.blue.score
          : null,
        blue1: teamKeyToNumber(match.alliances.blue.team_keys[0]),
        blue2: teamKeyToNumber(match.alliances.blue.team_keys[1]),
        blue3: teamKeyToNumber(match.alliances.blue.team_keys[2]),
      };
    });

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

  const rankingRows = (
    Array.isArray(rankingsResponse.rankings) ? rankingsResponse.rankings : []
  ).map((row) => {
    const wins = row.record?.wins ?? 0;
    const losses = row.record?.losses ?? 0;
    const ties = row.record?.ties ?? 0;

    return {
      id: row.team_key,
      rank: typeof row.rank === "number" ? row.rank : null,
      teamNumber: teamKeyToNumber(row.team_key),
      record: `${wins}-${losses}-${ties}`,
      avgMatch: formatSortOrderValue(row.sort_orders, avgMatchIndex),
      avgAutoFuel: formatSortOrderValue(row.sort_orders, avgAutoFuelIndex),
      avgTower: formatSortOrderValue(row.sort_orders, avgTowerIndex),
    };
  });

  return {
    qualificationRows,
    rankingRows,
  };
}
