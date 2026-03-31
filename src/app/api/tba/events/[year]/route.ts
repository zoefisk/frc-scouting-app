import { NextResponse } from "next/server";

type Params = {
    params: Promise<{
        year: string;
    }>;
};

export async function GET(_: Request, { params }: Params) {
    const { year } = await params;
    const apiKey = process.env.TBA_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing TBA_KEY environment variable." },
            { status: 500 }
        );
    }

    const res = await fetch(
        `https://www.thebluealliance.com/api/v3/events/${year}/simple`,
        {
            headers: {
                "X-TBA-Auth-Key": apiKey,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to fetch events from TBA." },
            { status: res.status }
        );
    }

    const data = await res.json();

    const mapped = (data ?? []).map((event: { key: string; name: string }) => ({
        key: event.key,
        name: event.name,
    }));

    return NextResponse.json(mapped);
}
