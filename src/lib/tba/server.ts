type TbaTeamSimple = {
    key: string;
    team_number: number;
    nickname?: string;
};

type TbaRankingRow = {
    team_key: string;
    rank: number;
};

type TbaRankingsResponse = {
    rankings?: TbaRankingRow[];
};

export type EventTeamWithRank = {
    key: string;
    teamNumber: number;
    nickname: string;
    rank: number | null;
};

function getTbaHeaders() {
    const apiKey = process.env.TBA_KEY;

    if (!apiKey) {
        throw new Error("Missing TBA_API_KEY environment variable.");
    }

    return {
        "X-TBA-Auth-Key": apiKey,
    };
}

async function fetchTbaJson<T>(path: string): Promise<T> {
    const res = await fetch(`https://www.thebluealliance.com/api/v3${path}`, {
        headers: getTbaHeaders(),
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TBA request failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<T>;
}

export async function getEventTeamsWithRanks(
    eventKey: string
): Promise<EventTeamWithRank[]> {
    const [teamsData, rankingsData] = await Promise.all([
        fetchTbaJson<unknown>(`/event/${eventKey}/teams/simple`),
        fetchTbaJson<unknown>(`/event/${eventKey}/rankings`),
    ]);

    const teams: TbaTeamSimple[] = Array.isArray(teamsData) ? teamsData : [];
    const rankings: TbaRankingRow[] =
        typeof rankingsData === "object" &&
        rankingsData !== null &&
        Array.isArray((rankingsData as TbaRankingsResponse).rankings)
            ? (rankingsData as TbaRankingsResponse).rankings!
            : [];

    const rankMap = new Map<string, number>();
    for (const row of rankings) {
        if (typeof row.team_key === "string" && typeof row.rank === "number") {
            rankMap.set(row.team_key, row.rank);
        }
    }

    return [...teams]
        .map((team) => ({
            key: team.key,
            teamNumber: team.team_number,
            nickname: team.nickname ?? "",
            rank: rankMap.get(team.key) ?? null,
        }))
        .sort((a, b) => {
            if (a.rank != null && b.rank != null) return a.rank - b.rank;
            if (a.rank != null) return -1;
            if (b.rank != null) return 1;
            return a.teamNumber - b.teamNumber;
        });
}
