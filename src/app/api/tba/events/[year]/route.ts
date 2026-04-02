import { NextResponse } from "next/server";
import { getEvents } from "@/lib/server/tba/service";

type Params = {
  params: Promise<{
    year: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { year } = await params;
    const data = await getEvents(year);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch events from TBA:", error);
    return NextResponse.json(
      { error: "Failed to fetch events from TBA." },
      { status: 500 }
    );
  }
}
