// src/lib/scouting/questionnaires/builtins/matchScoutingV1.ts

import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

export const matchScoutingV1: QuestionnaireDefinition = {
  id: "match-scouting",
  name: "Match Scouting",
  version: 1,
  description: "Standard match scouting form",

  sections: [
    {
      id: "auto",
      title: "Autonomous",
      fields: [
        {
          id: "auto_mobility",
          type: "boolean",
          label: "Mobility (left starting zone)",
        },
        {
          id: "auto_pieces_scored",
          type: "number",
          label: "Game Pieces Scored",
          min: 0,
        },
        {
          id: "auto_notes",
          type: "text",
          label: "Auto Notes",
          multiline: true,
        },
      ],
    },

    {
      id: "teleop",
      title: "Teleop",
      fields: [
        {
          id: "teleop_cycle_speed",
          type: "rating",
          label: "Cycle Speed",
          min: 1,
          max: 5,
        },
        {
          id: "teleop_scoring_consistency",
          type: "rating",
          label: "Scoring Consistency",
          min: 1,
          max: 5,
        },
        {
          id: "teleop_played_defense",
          type: "boolean",
          label: "Played Defense",
        },
        {
          id: "teleop_defense_effectiveness",
          type: "rating",
          label: "Defense Effectiveness",
          min: 1,
          max: 5,
          visibleWhen: {
            mode: "all",
            rules: [
              {
                fieldId: "teleop_played_defense",
                operator: "equals",
                value: true,
              },
            ],
          },
        },
      ],
    },

    {
      id: "endgame",
      title: "Endgame",
      fields: [
        {
          id: "endgame_status",
          type: "select",
          label: "Endgame Result",
          options: [
            { label: "None", value: "none" },
            { label: "Parked", value: "parked" },
            { label: "Climb", value: "climb" },
            { label: "Failed Attempt", value: "failed" },
          ],
        },
      ],
    },

    {
      id: "final",
      title: "Final Notes",
      fields: [
        {
          id: "final_driver_skill",
          type: "rating",
          label: "Driver Skill",
          min: 1,
          max: 5,
        },
        {
          id: "final_comments",
          type: "text",
          label: "Additional Comments",
          multiline: true,
        },
      ],
    },
  ],
};
