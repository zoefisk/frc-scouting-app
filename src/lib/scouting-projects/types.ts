export type ProjectAccessMode = "anonymous" | "authenticated";
export type ProjectDataMode = "match" | "pit" | "both";
export type MatchCollectionMode = "robot" | "alliance";
export type ProjectFormMode = "default" | "custom";

export type ScoutingProjectDoc = {
  projectId: string;
  name: string;

  eventKey: string;
  year: number;

  teamKeys: string[];

  accessMode: ProjectAccessMode;
  dataMode: ProjectDataMode;
  matchCollectionMode: MatchCollectionMode | null;
  formMode: ProjectFormMode;

  createdByUid: string;
  createdAt: string;
  updatedAt: string;

  inviteCode: string;
  inviteLinkToken: string;

  activeQuestionnaireIds?: {
    match?: string;
    pit?: string;
  };
};
