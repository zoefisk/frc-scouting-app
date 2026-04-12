import { NextResponse } from "next/server";

import { getProjectMatchCoverageSummary } from "@/lib/firebase/server/entries";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Scouting project not found." },
        { status: 404 }
      );
    }

    const coverage = await getProjectMatchCoverageSummary(
      projectId,
      project.eventKey
    );

    return NextResponse.json({ coverage });
  } catch (error) {
    console.error("Failed to load project match coverage:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not load project match coverage.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
