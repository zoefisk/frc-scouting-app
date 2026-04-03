// src/app/api/scouting-projects/route.ts

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { validateCreateScoutingProjectInput } from "@/lib/scouting-projects/validation";
import { buildScoutingProjectDoc } from "@/lib/scouting-projects/buildProjectDoc";
import { createScoutingProjectServerWithId } from "@/lib/firebase/server/projects";

// Replace this with your real auth lookup later
async function getCurrentUserId(): Promise<string | null> {
  // TODO: hook into your real auth/session system
  return "temporary-user-id";
}

export async function POST(request: Request) {
  try {
    const uid = await getCurrentUserId();

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

    return NextResponse.json(
      { error: "Failed to create scouting project." },
      { status: 500 }
    );
  }
}
