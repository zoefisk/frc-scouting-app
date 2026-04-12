import { NextResponse } from "next/server";

import { getProjectPitCoverageSummary } from "@/lib/firebase/server/entries";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type Params = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { projectId } = await params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Scouting project not found." },
        { status: 404 }
      );
    }

    const coverage = await getProjectPitCoverageSummary(
      projectId,
      project.eventKey
    );

    return NextResponse.json({ coverage });
  } catch (error) {
    console.error("Failed to load project pit coverage:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project pit coverage.",
      },
      { status: 500 }
    );
  }
}
