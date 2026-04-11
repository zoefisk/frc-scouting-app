// src/app/api/questionnaires/route.ts

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import { validateCreateProjectQuestionnaireInput } from "@/lib/scouting-projects/questionnaires/validation";
import { buildProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/buildQuestionnaireDoc";
import { createProjectQuestionnaireServerWithId } from "@/lib/firebase/server/questionnaires";

export async function POST(request: Request) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const json = await request.json();
    const input = validateCreateProjectQuestionnaireInput(json);

    const questionnaireId = randomUUID();

    const questionnaireDoc = buildProjectQuestionnaireDoc({
      input,
      questionnaireId,
      createdByUid: uid,
    });

    await createProjectQuestionnaireServerWithId(
      questionnaireId,
      questionnaireDoc
    );

    return NextResponse.json({
      ok: true,
      questionnaireId,
    });
  } catch (error) {
    console.error("Failed to create questionnaire:", error);

    return NextResponse.json(
      { error: "Failed to create questionnaire." },
      { status: 500 }
    );
  }
}
