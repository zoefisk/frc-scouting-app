// src/app/api/scouting-projects/route.ts

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import { validateCreateScoutingProjectInput } from "@/lib/scouting-projects/validation";
import { buildScoutingProjectDoc } from "@/lib/scouting-projects/buildProjectDoc";
import {
  createScoutingProjectServerWithId,
  getScoutingProjectByInviteCodeServer,
  getScoutingProjectByInviteLinkTokenServer,
} from "@/lib/firebase/server/projects";

export async function POST(request: Request) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const input = validateCreateScoutingProjectInput(json);

    const projectId = randomUUID();

    let projectDoc = buildScoutingProjectDoc({
      input,
      projectId,
      createdByUid: uid,
    });

    // retry a few times if code/token collide
    for (let i = 0; i < 5; i++) {
      const [codeMatch, tokenMatch] = await Promise.all([
        getScoutingProjectByInviteCodeServer(projectDoc.inviteCode),
        getScoutingProjectByInviteLinkTokenServer(projectDoc.inviteLinkToken),
      ]);

      if (!codeMatch && !tokenMatch) {
        break;
      }

      projectDoc = buildScoutingProjectDoc({
        input,
        projectId,
        createdByUid: uid,
      });

      if (i === 4) {
        return NextResponse.json(
          { error: "Failed to generate a unique invite." },
          { status: 500 }
        );
      }
    }

    await createScoutingProjectServerWithId(projectId, projectDoc);

    return NextResponse.json({
      ok: true,
      projectId,
    });
  } catch (error) {
    console.error("Failed to create scouting project:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create scouting project.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
