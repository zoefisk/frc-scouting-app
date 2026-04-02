import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    eventKey: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { eventKey } = await params;
  const apiKey = process.env.TBA_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing TBA_KEY environment variable." },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`,
    {
      headers: {
        "X-TBA-Auth-Key": apiKey,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch rankings from TBA." },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
