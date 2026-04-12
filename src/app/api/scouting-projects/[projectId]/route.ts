import { NextResponse } from "next/server";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import {
  deleteScoutingProjectCascadeServer,
  getScoutingProjectServer,
} from "@/lib/firebase/server/projects";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { projectId } = await context.params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (getProjectMemberRole(project, uid) !== "owner") {
      return NextResponse.json(
        { error: "Only the project owner can delete this project." },
        { status: 403 }
      );
    }

    await deleteScoutingProjectCascadeServer(projectId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete scouting project:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete scouting project.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
