import { NextResponse } from "next/server";
import { getEventRankings } from "@/lib/scouting/tba/service";

type Params = {
  params: Promise<{
    eventKey: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { eventKey } = await params;
    const data = await getEventRankings(eventKey);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch rankings from TBA:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings from TBA." },
      { status: 500 }
    );
  }
}
