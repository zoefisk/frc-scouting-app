import { NextResponse } from "next/server";
import { getEventMatches } from "@/lib/server/tba/service";

type Params = {
  params: Promise<{
    eventKey: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { eventKey } = await params;
    const data = await getEventMatches(eventKey);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch event matches from TBA:", error);
    return NextResponse.json(
      { error: "Failed to fetch event matches from TBA." },
      { status: 500 }
    );
  }
}
