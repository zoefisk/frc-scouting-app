import type {
  ProjectAccessMode,
  ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

export type ProjectListItem = {
  id: string;
  name: string;
  eventKey: string;
  year: number;
  dataMode: ScoutingProjectDoc["dataMode"];
  accessMode: ProjectAccessMode;
  source: "owned" | "joined" | "device";
  pinned: boolean;
};
