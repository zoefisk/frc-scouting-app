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
  now?: string;
};

function uniqueSortedStrings(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort();
}

export function buildScoutingProjectDoc({
  input,
  projectId,
  createdByUid,
  now = new Date().toISOString(),
}: BuildScoutingProjectDocArgs): ScoutingProjectDoc {
  const teamKeys = uniqueSortedStrings(input.teamKeys);

  const activeQuestionnaireIds: ScoutingProjectDoc["activeQuestionnaireIds"] =
    {};

  if (input.dataMode === "match" || input.dataMode === "both") {
    activeQuestionnaireIds.match = "match-scouting";
  }

  if (input.dataMode === "pit" || input.dataMode === "both") {
    activeQuestionnaireIds.pit = "pit-scouting";
  }

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

    scoutingSchedule: undefined,

    createdByUid,
    createdAt: now,
    updatedAt: now,

    inviteCode: generateInviteCodeGrouped(),
    inviteLinkToken: generateInviteLinkToken(),
  };
}
