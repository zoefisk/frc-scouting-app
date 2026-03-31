type TbaAlliance = {
    team_keys: string[];
    score: number;
};

type TbaMatch = {
    key: string;
    comp_level: string;
    match_number: number;
    alliances: {
        blue: TbaAlliance;
        red: TbaAlliance;
    };
};

export type EventQualificationMatch = {
    matchKey: string;
    matchNumber: number;
    blueTeams: number[];
    redTeams: number[];
};

function getTbaHeaders() {
    const apiKey = process.env.TBA_API_KEY ?? process.env.TBA_KEY;

    if (!apiKey) {
        throw new Error("Missing TBA API key.");
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

function teamKeyToNumber(teamKey: string): number {
    return Number(teamKey.replace("frc", ""));
}

export async function getEventQualificationMatches(
    eventKey: string
): Promise<EventQualificationMatch[]> {
    const matches = await fetchTbaJson<TbaMatch[]>(`/event/${eventKey}/matches`);

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
