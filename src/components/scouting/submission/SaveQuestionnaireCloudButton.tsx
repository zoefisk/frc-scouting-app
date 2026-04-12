import React from "react";
import { Button } from "@mui/material";

import {
  saveMatchScoutingEntry,
  savePitScoutingEntry,
} from "@/lib/firebase/client/entries";
import { useToast } from "@/lib/hooks/useToast";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { ScoutingSetupState } from "@/components/scouting/submission/types";

type Props = {
  questionnaire: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  setup: ScoutingSetupState;
  disabled?: boolean;
  onReset?: () => void;
  onSuccess?: () => void;
};

function buildGenericQuestionnairePayload(
  questionnaire: QuestionnaireDefinition,
  answers: QuestionnaireAnswers,
  setup: ScoutingSetupState,
  entryId: string
) {
  const numericMatchNumber = setup.matchNumber
    ? Number(setup.matchNumber)
    : null;
  const selectedTeam = setup.selectedTeam;

  return {
    v: 1,
    type: "questionnaire_response",
    entryId,
    projectId: setup.projectId ?? null,
    eventKey: setup.eventKey,
    matchNumber: numericMatchNumber,
    scoutingPosition: setup.scoutingPosition ?? null,
    teamPresence: setup.teamPresence ?? null,
    teamKey: selectedTeam?.key ?? null,
    teamNumber: selectedTeam?.team_number ?? null,
    teamName:
      selectedTeam?.nickname ?? selectedTeam?.name ?? selectedTeam?.key ?? "",
    selectedTeamKey: selectedTeam?.key ?? null,
    questionnaire: {
      id: questionnaire.id,
      name: questionnaire.name,
      version: questionnaire.version,
    },
    setup: {
      kind: setup.kind,
      projectId: setup.projectId ?? null,
      eventKey: setup.eventKey,
      matchNumber: numericMatchNumber,
      scoutingPosition: setup.scoutingPosition ?? null,
      teamPresence: setup.teamPresence ?? null,
      teamKey: selectedTeam?.key ?? null,
      teamNumber: selectedTeam?.team_number ?? null,
      teamName:
        selectedTeam?.nickname ?? selectedTeam?.name ?? selectedTeam?.key ?? "",
    },
    answers,
    savedAt: new Date().toISOString(),
  };
}

export default function SaveQuestionnaireCloudButton({
  questionnaire,
  answers,
  setup,
  disabled = false,
  onReset,
  onSuccess,
}: Props) {
  const toast = useToast();

  const handleSaveCloud = async () => {
    if (!setup.selectedTeam?.team_number) {
      toast.warning("No team selected.");
      return;
    }

    const matchNumber = Number(setup.matchNumber);
    if (setup.kind === "match" && !Number.isFinite(matchNumber)) {
      toast.warning("Match number must be numeric to save to cloud.");
      return;
    }

    try {
      const entryId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${setup.selectedTeam.key}`;

      const payload = buildGenericQuestionnairePayload(
        questionnaire,
        answers,
        setup,
        entryId
      );

      if (setup.kind === "match") {
        await saveMatchScoutingEntry({
          eventKey: setup.eventKey,
          matchNumber,
          entryId,
          payload,
        });
      } else {
        await savePitScoutingEntry({
          eventKey: setup.eventKey,
          teamKey: setup.selectedTeam.key,
          entryId,
          payload,
        });
      }

      toast.success("Saved to cloud.");
      onSuccess?.();
      onReset?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save to cloud.");
    }
  };

  return (
    <Button variant="outlined" onClick={handleSaveCloud} disabled={disabled}>
      Save to Cloud
    </Button>
  );
}
