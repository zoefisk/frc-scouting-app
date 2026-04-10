import { NextResponse } from "next/server";
import { getTeam } from "@/lib/scouting/tba/service";

type Params = {
  params: Promise<{
    teamNumber: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { teamNumber } = await params;
    const data = await getTeam(teamNumber);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch team info from TBA:", error);
    return NextResponse.json(
      { error: "Failed to fetch team info from TBA." },
      { status: 500 }
    );
  }
}
