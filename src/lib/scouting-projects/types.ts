export type ProjectAccessMode = "anonymous" | "authenticated";
export type ProjectDataMode = "match" | "pit" | "both";
export type MatchCollectionMode = "robot" | "alliance";
export type ProjectFormMode = "default" | "custom";
export type ProjectStatus = "active" | "inactive";
export type ScoutingScheduleMode = MatchCollectionMode;
export type ProjectMemberRole = "owner" | "admin" | "member";

export type ScoutingProjectMember = {
  uid: string;
  role: ProjectMemberRole;
};

export const SCOUTING_SCHEDULE_SLOTS_BY_MODE = {
  robot: ["red1", "red2", "red3", "blue1", "blue2", "blue3"],
  alliance: ["redAlliance", "blueAlliance"],
} as const;

export type ScoutingScheduleSlot =
  (typeof SCOUTING_SCHEDULE_SLOTS_BY_MODE)[keyof typeof SCOUTING_SCHEDULE_SLOTS_BY_MODE][number];

export type ScoutingScheduleEntry = {
  matchNumber: number;
  assignments: Partial<Record<ScoutingScheduleSlot, string | null>>;
  hasCollectedData?: boolean | null;
};

export type ScoutingScheduleDoc = {
  mode: ScoutingScheduleMode;
  scouterNames: string[];
  matches: ScoutingScheduleEntry[];
  updatedAt: string;
};

export type ScoutingProjectDoc = {
  projectId: string;
  name: string;

  eventKey: string;
  year: number;

  teamKeys: string[];

  accessMode: ProjectAccessMode;
  status: ProjectStatus;
  allowMemberInvites: boolean;
  dataMode: ProjectDataMode;
  matchCollectionMode: MatchCollectionMode | null;
  formMode: ProjectFormMode;

  createdByUid: string;
  memberUids: string[];
  members: ScoutingProjectMember[];
  createdAt: string;
  updatedAt: string;

  inviteCode: string;
  inviteLinkToken: string;

  activeQuestionnaireIds?: {
    match?: string;
    pit?: string;
  };

  scoutingSchedule?: ScoutingScheduleDoc;
};

export function hasMatchData(dataMode: ProjectDataMode): boolean {
  return dataMode === "match" || dataMode === "both";
}

export function hasPitData(dataMode: ProjectDataMode): boolean {
  return dataMode === "pit" || dataMode === "both";
}

export function getProjectMemberRole(
  project: Pick<ScoutingProjectDoc, "createdByUid" | "members">,
  uid: string | null | undefined
): ProjectMemberRole | null {
  if (!uid) {
    return null;
  }

  if (project.createdByUid === uid) {
    return "owner";
  }

  return (
    (project.members ?? []).find((member) => member.uid === uid)?.role ?? null
  );
}
