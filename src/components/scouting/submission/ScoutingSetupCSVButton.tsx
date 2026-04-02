"use client";

import React from "react";
import { Button } from "@mui/material";

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
  QuestionnaireFieldDefinition,
} from "@/lib/scouting/questionnaire/types";
import { TeamOption } from "@/lib/server/client/loadEventTeams";

type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: string | null;
  teamPresence: string;
  selectedTeam: TeamOption | null;
};

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: MatchSetupState;
  disabled?: boolean;
};

function escapeCsvValue(value: unknown) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getAllFields(
  questionnaire: QuestionnaireDefinition
): QuestionnaireFieldDefinition[] {
  return questionnaire.sections.flatMap((section) => section.fields);
}

export default function ScoutingSetupCsvButton({
  questionnaire,
  answers,
  setup,
  disabled = false,
}: Props) {
  const isIncomplete =
    !setup.eventKey ||
    !setup.matchNumber ||
    !setup.scoutingPosition ||
    !setup.selectedTeam;

  const handleDownload = () => {
    const fields = getAllFields(questionnaire);

    const metadataEntries: Array<[string, unknown]> = [
      ["questionnaireId", questionnaire.id],
      ["questionnaireName", questionnaire.name],
      ["questionnaireVersion", questionnaire.version],
      ["eventKey", setup.eventKey],
      ["matchNumber", setup.matchNumber],
      ["scoutingPosition", setup.scoutingPosition],
      ["teamPresence", setup.teamPresence],
      ["teamKey", setup.selectedTeam?.key ?? ""],
      ["teamNumber", setup.selectedTeam?.team_number ?? ""],
      [
        "teamName",
        setup.selectedTeam?.nickname ??
          setup.selectedTeam?.name ??
          setup.selectedTeam?.key ??
          "",
      ],
      ["savedAt", new Date().toISOString()],
    ];

    const answerEntries: Array<[string, unknown]> = fields.map((field) => [
      field.id,
      answers[field.id] ?? "",
    ]);

    const allEntries = [...metadataEntries, ...answerEntries];

    const headers = allEntries.map(([key]) => key);
    const values = allEntries.map(([, value]) => value);

    const csv = [
      headers.map(escapeCsvValue).join(","),
      values.map(escapeCsvValue).join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const teamLabel = setup.selectedTeam?.team_number
      ? `team-${setup.selectedTeam.team_number}`
      : "team";
    const matchLabel = setup.matchNumber || "match";

    const fileName = `${questionnaire.id}-${setup.eventKey}-${matchLabel}-${teamLabel}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      onClick={handleDownload}
      disabled={disabled || isIncomplete}
    >
      Download CSV
    </Button>
  );
}
