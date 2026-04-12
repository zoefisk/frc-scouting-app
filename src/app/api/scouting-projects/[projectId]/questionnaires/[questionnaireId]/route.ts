import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import {
  projectHasMatchScoutingData,
  projectHasPitScoutingData,
} from "@/lib/firebase/server/entries";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import {
  getProjectQuestionnaireServer,
  updateProjectQuestionnaireServer,
} from "@/lib/firebase/server/questionnaires";
import { questionnaireSchema } from "@/lib/scouting/questionnaire/schema";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";

const updateBuilderQuestionnaireInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  definition: questionnaireSchema,
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      projectId: string;
      questionnaireId: string;
    }>;
  }
) {
  try {
    const uid = await getAuthenticatedUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { projectId, questionnaireId } = await context.params;
    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    if (getProjectMemberRole(project, uid) !== "owner") {
      return NextResponse.json(
        { error: "Only project owners can manage project questionnaires." },
        { status: 403 }
      );
    }

    const questionnaire = await getProjectQuestionnaireServer(questionnaireId);

    if (!questionnaire || questionnaire.projectId !== projectId) {
      return NextResponse.json(
        { error: "Questionnaire not found." },
        { status: 404 }
      );
    }

    const hasExistingData =
      questionnaire.kind === "match"
        ? await projectHasMatchScoutingData(projectId, project.eventKey)
        : await projectHasPitScoutingData(projectId, project.eventKey);

    if (hasExistingData) {
      return NextResponse.json(
        {
          error:
            questionnaire.kind === "match"
              ? "This project already has match scouting data, so its questionnaire is locked."
              : "This project already has pit scouting data, so its questionnaire is locked.",
        },
        { status: 409 }
      );
    }

    const parsed = updateBuilderQuestionnaireInputSchema.safeParse(
      await request.json()
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid questionnaire update." },
        { status: 400 }
      );
    }

    await updateProjectQuestionnaireServer(questionnaireId, {
      name: parsed.data.name,
      definition: parsed.data.definition,
      version: questionnaire.version + 1,
      isActive: true,
    });

    return NextResponse.json({
      ok: true,
      questionnaireId,
    });
  } catch (error) {
    console.error("Failed to update builder questionnaire:", error);

    return NextResponse.json(
      { error: "Failed to update project questionnaire." },
      { status: 500 }
    );
  }
}
