import React from "react";
import { Button } from "@mui/material";

import { saveSubmission } from "../../../lib/db";
import { useToast } from "@/lib/hooks/useToast";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { ScoutingSetupState } from "@/components/scouting/submission/types";
import {
  buildGenericQuestionnairePayload,
  buildMatchQuestionnairePayloads,
} from "@/lib/scouting/match/buildSubmissionPayloads";

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: ScoutingSetupState;
  disabled?: boolean;
  onReset?: () => void;
  onSuccess?: () => void;
};

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
      if (setup.kind === "match") {
        const payloads = buildMatchQuestionnairePayloads(
          questionnaire,
          answers,
          setup,
          (teamKey) =>
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${teamKey ?? "response"}`
        );

        await Promise.all(
          payloads.map(({ entryId, payload }) =>
            saveSubmission({
              submissionId: entryId,
              projectId: setup.projectId,
              eventKey: setup.eventKey,
              matchNumber: setup.matchNumber,
              payload,
            })
          )
        );
      } else {
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
          projectId: setup.projectId,
          eventKey: setup.eventKey,
          matchNumber: setup.matchNumber,
          payload,
        });
      }

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
