import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import { buildScoutingProjectDoc } from "@/lib/scouting-projects/buildProjectDoc";
import { createScoutingProjectServerWithId } from "@/lib/firebase/server/projects";

import { buildProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/buildQuestionnaireDoc";
import { createProjectQuestionnaireServerWithId } from "@/lib/firebase/server/questionnaires";

import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";

export async function POST(request: Request) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const projectId = randomUUID();
    const questionnaireId = randomUUID();

    // --- PROJECT ---
    const projectDoc = buildScoutingProjectDoc({
      input: {
        name: "Example Project",
        eventKey: "2026test",
        year: 2026,
        teamKeys: ["frc1", "frc2", "frc3"],
        accessMode: "authenticated",
        dataMode: "match",
        matchCollectionMode: "robot",
      },
      projectId,
      createdByUid: uid,
    });

    await createScoutingProjectServerWithId(projectId, projectDoc);

    // --- QUESTIONNAIRE ---
    const questionnaireDoc = buildProjectQuestionnaireDoc({
      input: {
        projectId,
        kind: "match",
        name: "Default Match Scouting",
        version: 1,
        definition: matchScoutingV1,
        isActive: true,
        source: "builtin",
        basedOnQuestionnaireId: "match-scouting",
      },
      questionnaireId,
      createdByUid: uid,
    });

    await createProjectQuestionnaireServerWithId(
      questionnaireId,
      questionnaireDoc
    );

    return NextResponse.json({
      ok: true,
      projectId,
      questionnaireId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create example project" },
      { status: 500 }
    );
  }
}
