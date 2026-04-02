import React from "react";
import { Button } from "@mui/material";

import { saveMatchScoutingEntry } from "@/lib/firebase/client/entries";
import { useToast } from "@/lib/hooks/useToast";
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
  entryId: string
) {
  return {
    v: 1,
    type: "questionnaire_response",
    entryId,
    questionnaire: {
      id: questionnaire.id,
      name: questionnaire.name,
      version: questionnaire.version,
    },
    setup: {
      eventKey: setup.eventKey,
      matchNumber: Number(setup.matchNumber),
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
    if (!Number.isFinite(matchNumber)) {
      toast.warning("Match number must be numeric to save to cloud.");
      return;
    }

    try {
      const entryId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${setup.selectedTeam.key}`;

      await saveMatchScoutingEntry({
        eventKey: setup.eventKey,
        matchNumber,
        entryId,
        payload: buildGenericQuestionnairePayload(
          questionnaire,
          answers,
          setup,
          entryId
        ),
      });

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
