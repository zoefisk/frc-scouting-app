import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import {
  createProjectQuestionnaireServerWithId,
  getProjectQuestionnaireServer,
} from "@/lib/firebase/server/questionnaires";
import {
  getScoutingProjectServer,
  updateScoutingProjectServer,
} from "@/lib/firebase/server/projects";
import {
  projectHasMatchScoutingData,
  projectHasPitScoutingData,
} from "@/lib/firebase/server/entries";
import { buildProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/buildQuestionnaireDoc";
import {
  buildDefaultQuestionnaireTemplate,
  buildScratchQuestionnaireTemplate,
} from "@/lib/scouting-projects/questionnaires/templates";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";

const createBuilderQuestionnaireInputSchema = z.object({
  kind: z.enum(["match", "pit"]),
  template: z.enum(["default", "scratch"]),
});

function getKindLabel(kind: "match" | "pit") {
  return kind === "match" ? "Match" : "Pit";
}

export async function POST(
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
        { error: "Only project owners can manage project questionnaires." },
        { status: 403 }
      );
    }

    const parsed = createBuilderQuestionnaireInputSchema.safeParse(
      await request.json()
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid questionnaire builder request." },
        { status: 400 }
      );
    }

    const { kind, template } = parsed.data;

    const hasExistingData =
      kind === "match"
        ? await projectHasMatchScoutingData(projectId, project.eventKey)
        : await projectHasPitScoutingData(projectId, project.eventKey);

    if (hasExistingData) {
      return NextResponse.json(
        {
          error:
            kind === "match"
              ? "This project already has match scouting data, so its questionnaire is locked."
              : "This project already has pit scouting data, so its questionnaire is locked.",
        },
        { status: 409 }
      );
    }

    const activeQuestionnaireId = project.activeQuestionnaireIds?.[kind];
    const existingCustomQuestionnaire = activeQuestionnaireId
      ? await getProjectQuestionnaireServer(activeQuestionnaireId)
      : null;

    if (existingCustomQuestionnaire) {
      return NextResponse.json({
        ok: true,
        questionnaireId: existingCustomQuestionnaire.id,
        reusedExisting: true,
      });
    }

    const questionnaireId = randomUUID();
    const questionnaireDoc = buildProjectQuestionnaireDoc({
      input: {
        projectId,
        kind,
        name: `${project.name} ${getKindLabel(kind)} Questionnaire`,
        version: 1,
        isActive: true,
        source: "custom",
        basedOnQuestionnaireId:
          template === "default"
            ? kind === "match"
              ? "match-scouting"
              : "pit-scouting"
            : null,
        definition:
          template === "default"
            ? buildDefaultQuestionnaireTemplate(kind)
            : buildScratchQuestionnaireTemplate(kind),
      },
      questionnaireId,
      createdByUid: uid,
    });

    await createProjectQuestionnaireServerWithId(
      questionnaireId,
      questionnaireDoc
    );
    await updateScoutingProjectServer(projectId, {
      activeQuestionnaireIds: {
        ...project.activeQuestionnaireIds,
        [kind]: questionnaireId,
      },
    });

    return NextResponse.json({
      ok: true,
      questionnaireId,
      reusedExisting: false,
    });
  } catch (error) {
    console.error("Failed to create builder questionnaire:", error);

    return NextResponse.json(
      { error: "Failed to create project questionnaire." },
      { status: 500 }
    );
  }
}
