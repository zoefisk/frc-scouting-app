import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

export const matchScoutingAllianceV1: QuestionnaireDefinition = {
  id: "match-scouting-alliance",
  name: "Match Scouting (Alliance)",
  version: 1,
  description: "Standard alliance-mode match scouting form",

  sections: [
    {
      id: "auto",
      title: "Autonomous",
      fields: [
        {
          id: "auto_alliance_mobility_count",
          type: "number",
          label: "Robots with Mobility",
          min: 0,
          max: 3,
        },
        {
          id: "auto_alliance_pieces_scored",
          type: "number",
          label: "Alliance Game Pieces Scored",
          min: 0,
        },
        {
          id: "auto_alliance_notes",
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
          id: "teleop_primary_scorer",
          type: "text",
          label: "Primary Scoring Robot(s)",
        },
        {
          id: "teleop_cycle_speed",
          type: "rating",
          label: "Alliance Cycle Speed",
          min: 1,
          max: 5,
        },
        {
          id: "teleop_scoring_consistency",
          type: "rating",
          label: "Alliance Scoring Consistency",
          min: 1,
          max: 5,
        },
        {
          id: "teleop_played_defense",
          type: "boolean",
          label: "Any Robot Played Defense",
        },
        {
          id: "teleop_defense_effectiveness",
          type: "rating",
          label: "Alliance Defense Effectiveness",
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
        {
          id: "teleop_alliance_notes",
          type: "text",
          label: "Teleop Notes",
          multiline: true,
        },
      ],
    },

    {
      id: "endgame",
      title: "Endgame",
      fields: [
        {
          id: "endgame_climbed_count",
          type: "number",
          label: "Robots with Successful Endgame",
          min: 0,
          max: 3,
        },
        {
          id: "endgame_notes",
          type: "text",
          label: "Endgame Notes",
          multiline: true,
        },
      ],
    },

    {
      id: "final",
      title: "Final Notes",
      fields: [
        {
          id: "final_alliance_synergy",
          type: "rating",
          label: "Alliance Coordination",
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
