import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUserIdFromRequest } from "@/lib/firebase/server/auth";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import { getQuestionnaireBuilderChatReply } from "@/lib/openai/server";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";

const questionnaireBuilderChatSchema = z.object({
  kind: z.enum(["match", "pit"]),
  message: z.string().trim().min(1).max(2000),
  questionnaireName: z.string().max(200).optional().default(""),
  definitionText: z.string().min(1).max(20000),
});

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
        { error: "Only project owners can use the questionnaire AI helper." },
        { status: 403 }
      );
    }

    const parsed = questionnaireBuilderChatSchema.safeParse(
      await request.json()
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid questionnaire helper request." },
        { status: 400 }
      );
    }

    const reply = await getQuestionnaireBuilderChatReply({
      ...parsed.data,
      projectName: project.name,
      eventKey: project.eventKey,
      matchCollectionMode: project.matchCollectionMode,
    });

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    console.error("Failed to get questionnaire builder chat reply:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Could not get questionnaire builder chat reply.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
