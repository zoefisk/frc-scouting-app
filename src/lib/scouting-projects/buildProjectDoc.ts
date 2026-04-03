import type { CreateScoutingProjectInput } from "./validation";
import { ScoutingProjectDoc } from "@/lib/scouting-projects/types";
import {
  generateInviteCodeGrouped,
  generateInviteLinkToken,
} from "@/lib/scouting-projects/generateInviteCode";

type BuildScoutingProjectDocArgs = {
  input: CreateScoutingProjectInput;
  projectId: string;
  createdByUid: string;
  inviteCode: string;
  inviteLinkToken: string;
  now?: string;
};

function uniqueSortedStrings(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort();
}

export function buildScoutingProjectDoc({
  input,
  projectId,
  createdByUid,
  inviteCode,
  inviteLinkToken,
  now = new Date().toISOString(),
}: BuildScoutingProjectDocArgs): ScoutingProjectDoc {
  const teamKeys = uniqueSortedStrings(input.teamKeys);

  const activeQuestionnaireIds = {
    match:
      input.dataMode === "match" || input.dataMode === "both"
        ? "match-scouting"
        : null,
    pit:
      input.dataMode === "pit" || input.dataMode === "both"
        ? "pit-scouting"
        : null,
  };

  return {
    projectId,
    name: input.name.trim(),

    eventKey: input.eventKey.trim(),
    year: input.year,
    teamKeys,

    accessMode: input.accessMode,
    dataMode: input.dataMode,
    matchCollectionMode: input.matchCollectionMode,
    formMode: input.formMode,

    activeQuestionnaireIds,

    createdByUid,
    createdAt: now,
    updatedAt: now,

    inviteCode: generateInviteCodeGrouped(),
    inviteLinkToken: generateInviteLinkToken(),
  };
}
