export const ALLIANCE_SELECTOR_DOC_ID = "current";

export type AllianceSelectorTeam = {
  originalRank: number;
  teamKey: string;
  teamNumber: number;
  nickname: string;
  reasoning: string;
};

export type AllianceSelectorDoc = {
  projectId: string;
  year: number;
  eventKey: string;
  teams: AllianceSelectorTeam[];
  removedTeams: AllianceSelectorTeam[];
  updatedAt: string;
  updatedByUid: string | null;
};
