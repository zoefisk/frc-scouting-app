import type {
  ProjectAccessMode,
  ProjectMemberRole,
  ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

export type ProjectListItem = {
  id: string;
  name: string;
  eventKey: string;
  year: number;
  status: ScoutingProjectDoc["status"];
  dataMode: ScoutingProjectDoc["dataMode"];
  accessMode: ProjectAccessMode;
  source: "owned" | "joined" | "device";
  memberRole: ProjectMemberRole | null;
  pinned: boolean;
  isGloballyArchived: boolean;
  isLocallyArchived: boolean;
};
