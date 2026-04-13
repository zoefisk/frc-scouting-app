import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import {
  getAllianceSelectorServer,
  saveAllianceSelectorServer,
} from "@/lib/firebase/server/allianceSelector";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import {
  canEditProjectAllianceSelector,
  getProjectMemberRole,
} from "@/lib/scouting-projects/types";

const allianceSelectorTeamSchema = z.object({
  originalRank: z.number(),
  teamKey: z.string().min(1),
  teamNumber: z.number(),
  nickname: z.string(),
  reasoning: z.string(),
});

const saveAllianceSelectorSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  eventKey: z.string().min(1),
  teams: z.array(allianceSelectorTeamSchema),
  removedTeams: z.array(allianceSelectorTeamSchema),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);
    const { projectId } = await context.params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (project.accessMode === "authenticated") {
      if (!uid) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      if (!getProjectMemberRole(project, uid)) {
        return NextResponse.json(
          { error: "You do not have access to this project." },
          { status: 403 }
        );
      }
    }

    const selector = await getAllianceSelectorServer(projectId);

    return NextResponse.json({
      ok: true,
      selector,
    });
  } catch (error) {
    console.error("Failed to load alliance selector:", error);

    return NextResponse.json(
      { error: "Failed to load alliance selector." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);
    const { projectId } = await context.params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (project.lockAllianceSelectorEditing && !uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canEditProjectAllianceSelector(project, uid)) {
      return NextResponse.json(
        {
          error: project.lockAllianceSelectorEditing
            ? "Alliance selector editing is locked to project owners, admins, and assigned student leaders."
            : "You do not have permission to edit this alliance selector.",
        },
        { status: 403 }
      );
    }

    const parsed = saveAllianceSelectorSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid alliance selector payload." },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    if (
      payload.eventKey !== project.eventKey ||
      payload.year !== project.year
    ) {
      return NextResponse.json(
        {
          error:
            "Project alliance selector must stay locked to the project's event.",
        },
        { status: 400 }
      );
    }

    await saveAllianceSelectorServer(projectId, {
      projectId,
      year: payload.year,
      eventKey: payload.eventKey,
      teams: payload.teams,
      removedTeams: payload.removedTeams,
      updatedByUid: uid ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save alliance selector:", error);

    return NextResponse.json(
      { error: "Failed to save alliance selector." },
      { status: 500 }
    );
  }
}
