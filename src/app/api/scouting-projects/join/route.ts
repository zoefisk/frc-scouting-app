import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getScoutingProjectByInviteCodeServer,
  getScoutingProjectByInviteLinkTokenServer,
} from "@/lib/firebase/server/projects";

const joinLookupSchema = z
  .object({
    inviteCode: z.string().optional(),
    inviteLink: z.string().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.inviteCode?.trim()) || Boolean(value.inviteLink?.trim()),
    {
      message: "Invite code or invite link is required.",
    }
  );

function extractInviteLinkToken(inviteLink: string): string | null {
  const trimmed = inviteLink.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    const joinIndex = segments.findIndex((segment) => segment === "join");

    if (joinIndex === -1 || !segments[joinIndex + 1]) {
      return null;
    }

    return segments[joinIndex + 1];
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const parsed = joinLookupSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid invite code or invite link." },
        { status: 400 }
      );
    }

    const inviteCode = parsed.data.inviteCode?.trim() ?? "";
    const inviteLink = parsed.data.inviteLink?.trim() ?? "";
    const inviteLinkToken = inviteLink
      ? extractInviteLinkToken(inviteLink)
      : null;

    const project = inviteCode
      ? await getScoutingProjectByInviteCodeServer(inviteCode)
      : inviteLinkToken
        ? await getScoutingProjectByInviteLinkTokenServer(inviteLinkToken)
        : null;

    if (!project) {
      return NextResponse.json(
        { error: "No scouting project matched that invite." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      inviteLinkToken: project.inviteLinkToken,
      projectName: project.name,
    });
  } catch (error) {
    console.error("Failed to resolve scouting project invite:", error);

    return NextResponse.json(
      { error: "Could not resolve scouting project invite." },
      { status: 500 }
    );
  }
}
