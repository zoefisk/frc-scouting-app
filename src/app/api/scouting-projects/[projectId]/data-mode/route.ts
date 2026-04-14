import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import {
  deleteProjectMatchScoutingEntries,
  deleteProjectPitScoutingEntries,
  projectHasMatchScoutingData,
  projectHasPitScoutingData,
} from "@/lib/firebase/server/entries";
import {
  getScoutingProjectServer,
  updateScoutingProjectServer,
} from "@/lib/firebase/server/projects";
import {
  getProjectMemberRole,
  hasMatchData,
  hasPitData,
  type ProjectDataMode,
} from "@/lib/scouting-projects/types";

const updateProjectDataModeSchema = z.object({
  dataMode: z.enum(["match", "pit", "both"]),
});

export async function PUT(
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
        { error: "Only the project owner can change scouting modes." },
        { status: 403 }
      );
    }

    const parsed = updateProjectDataModeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project scouting mode request." },
        { status: 400 }
      );
    }

    const nextDataMode = parsed.data.dataMode as ProjectDataMode;
    const removesMatchData =
      hasMatchData(project.dataMode) && !hasMatchData(nextDataMode);
    const removesPitData =
      hasPitData(project.dataMode) && !hasPitData(nextDataMode);

    const [hasExistingMatchData, hasExistingPitData] = await Promise.all([
      removesMatchData
        ? projectHasMatchScoutingData(projectId, project.eventKey)
        : Promise.resolve(false),
      removesPitData
        ? projectHasPitScoutingData(projectId, project.eventKey)
        : Promise.resolve(false),
    ]);

    if (removesMatchData && hasExistingMatchData) {
      await deleteProjectMatchScoutingEntries(projectId, project.eventKey);
    }

    if (removesPitData && hasExistingPitData) {
      await deleteProjectPitScoutingEntries(projectId, project.eventKey);
    }

    const nextActiveQuestionnaireIds = {
      ...(project.activeQuestionnaireIds ?? {}),
    };

    if (!hasMatchData(nextDataMode)) {
      delete nextActiveQuestionnaireIds.match;
    }

    if (!hasPitData(nextDataMode)) {
      delete nextActiveQuestionnaireIds.pit;
    }

    await updateScoutingProjectServer(projectId, {
      dataMode: nextDataMode,
      matchCollectionMode: hasMatchData(nextDataMode)
        ? (project.matchCollectionMode ?? "robot")
        : null,
      activeQuestionnaireIds: nextActiveQuestionnaireIds,
    });

    revalidatePath("/scouting-projects");
    revalidatePath(`/scouting-projects/${projectId}`);
    revalidatePath(`/scouting-projects/${projectId}/settings`);
    revalidatePath(`/scouting-projects/${projectId}/match-scouting`);
    revalidatePath(`/scouting-projects/${projectId}/pit-scouting`);

    return NextResponse.json({
      ok: true,
      deletedMatchEntries: removesMatchData && hasExistingMatchData,
      deletedPitEntries: removesPitData && hasExistingPitData,
    });
  } catch (error) {
    console.error("Failed to update project scouting modes:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update project scouting modes.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
