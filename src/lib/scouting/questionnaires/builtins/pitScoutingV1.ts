// src/lib/scouting/questionnaires/builtins/pitScoutingV1.ts

import { QuestionnaireDefinition } from "@/lib/scouting/questionnaires/schema";

export const pitScoutingV1: QuestionnaireDefinition = {
  id: "pit-scouting",
  name: "Pit Scouting",
  version: 1,
  description: "Robot and team capabilities collected in pits",

  sections: [
    {
      id: "robot",
      title: "Robot Overview",
      fields: [
        {
          id: "robot_weight",
          type: "number",
          label: "Robot Weight (lbs)",
          min: 0,
        },
        {
          id: "robot_drive_type",
          type: "select",
          label: "Drive Type",
          options: [
            { label: "Tank", value: "tank" },
            { label: "Swerve", value: "swerve" },
            { label: "Mecanum", value: "mecanum" },
            { label: "Other", value: "other" },
          ],
        },
        {
          id: "robot_notes",
          type: "text",
          label: "Robot Notes",
          multiline: true,
        },
      ],
    },

    {
      id: "capabilities",
      title: "Capabilities",
      fields: [
        {
          id: "cap_auto",
          type: "boolean",
          label: "Has Autonomous",
        },
        {
          id: "cap_teleop_scoring",
          type: "boolean",
          label: "Can Score in Teleop",
        },
        {
          id: "cap_endgame",
          type: "boolean",
          label: "Has Endgame Mechanism",
        },
      ],
    },

    {
      id: "team",
      title: "Team Notes",
      fields: [
        {
          id: "team_experience",
          type: "select",
          label: "Experience Level",
          options: [
            { label: "Rookie", value: "rookie" },
            { label: "Mid-level", value: "mid" },
            { label: "Veteran", value: "veteran" },
          ],
        },
        {
          id: "team_comments",
          type: "text",
          label: "Additional Notes",
          multiline: true,
        },
      ],
    },
  ],
};
