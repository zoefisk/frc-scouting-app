import React from "react";
import { Button } from "@mui/material";

import { saveSubmission } from "@/old-lib/db";
import { useToast } from "@/old-lib/hooks/useToast";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { TeamOption } from "@/lib/server/client/loadEventTeams";

type ScoutingPosition = "blue1" | "blue2" | "blue3" | "red1" | "red2" | "red3";

type TeamPresence = "present" | "absent" | "surrogate";

type MatchSetupState = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamPresence: TeamPresence;
  selectedTeam: TeamOption | null;
};

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: MatchSetupState;
  disabled?: boolean;
  onReset?: () => void;
  onSuccess?: () => void;
};

function buildGenericQuestionnairePayload(
  questionnaire: QuestionnaireDefinition,
  answers: QuestionnaireAnswers,
  setup: MatchSetupState,
  submissionId: string
) {
  return {
    v: 1,
    type: "questionnaire_response",
    submissionId,
    questionnaire: {
      id: questionnaire.id,
      name: questionnaire.name,
      version: questionnaire.version,
    },
    setup: {
      eventKey: setup.eventKey,
      matchNumber: setup.matchNumber,
      scoutingPosition: setup.scoutingPosition,
      teamPresence: setup.teamPresence,
      teamKey: setup.selectedTeam?.key ?? null,
      teamNumber: setup.selectedTeam?.team_number ?? null,
      teamName:
        setup.selectedTeam?.nickname ??
        setup.selectedTeam?.name ??
        setup.selectedTeam?.key ??
        "",
    },
    answers,
    savedAt: new Date().toISOString(),
  };
}

export default function SaveQuestionnaireLocalButton({
  questionnaire,
  answers,
  setup,
  disabled = false,
  onReset,
  onSuccess,
}: Props) {
  const toast = useToast();

  const handleSaveLocal = async () => {
    try {
      const submissionId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${setup.selectedTeam?.key ?? "response"}`;

      const payload = buildGenericQuestionnairePayload(
        questionnaire,
        answers,
        setup,
        submissionId
      );

      await saveSubmission({
        submissionId,
        eventKey: setup.eventKey,
        matchNumber: setup.matchNumber,
        payload,
      });

      toast.success("Saved locally.");
      onSuccess?.();
      onReset?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save locally.");
    }
  };

  return (
    <Button variant="contained" onClick={handleSaveLocal} disabled={disabled}>
      Save to Local
    </Button>
  );
}
