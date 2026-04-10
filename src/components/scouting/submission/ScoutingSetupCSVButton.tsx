"use client";

import React from "react";
import { Button } from "@mui/material";

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";
import {
  buildQuestionnaireCsvExport,
  isQuestionnaireSetupComplete,
} from "@/lib/scouting/buildQuestionnaireCsvExport";

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

export default function ScoutingSetupCsvButton({
  questionnaire,
  answers,
  setup,
  disabled = false,
}: Props) {
  const isIncomplete = !isQuestionnaireSetupComplete(setup);

  const handleDownload = () => {
    const { csv, fileName } = buildQuestionnaireCsvExport({
      questionnaire,
      answers,
      setup,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

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
