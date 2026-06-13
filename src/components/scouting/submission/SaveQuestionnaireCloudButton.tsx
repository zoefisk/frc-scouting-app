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
    const selectedAllianceTeams =
      setup.matchCollectionMode === "alliance"
        ? (setup.allianceTeams ?? []).filter((entry) => entry.team != null)
        : [];

    if (
      setup.kind === "match" &&
      setup.matchCollectionMode === "alliance" &&
      selectedAllianceTeams.length !== 3
    ) {
      toast.warning("All three alliance teams must be available.");
      return;
    }

    if (setup.kind === "pit" && !setup.selectedTeam?.team_number) {
      toast.warning("No team selected.");
      return;
    }

    if (
      setup.kind === "match" &&
      setup.matchCollectionMode !== "alliance" &&
      !setup.selectedTeam?.team_number
    ) {
      toast.warning("No team selected.");
      return;
    }

    const matchNumber = Number(setup.matchNumber);
    if (setup.kind === "match" && !Number.isFinite(matchNumber)) {
      toast.warning("Match number must be numeric to save to cloud.");
      return;
    }

    try {
      if (setup.kind === "match") {
        const payloads = buildMatchQuestionnairePayloads(
          questionnaire,
          answers,
          setup,
          (teamKey) =>
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${teamKey ?? "match"}`
        );

        await Promise.all(
          payloads.map(({ entryId, payload }) =>
            saveMatchScoutingEntry({
              eventKey: setup.eventKey,
              matchNumber,
              entryId,
              payload,
            })
          )
        );
      } else {
        const selectedTeam = setup.selectedTeam;

        if (!selectedTeam) {
          toast.warning("No team selected.");
          return;
        }

        const entryId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${selectedTeam.key}`;
        const payload = buildGenericQuestionnairePayload(
          questionnaire,
          answers,
          setup,
          entryId
        );
        await savePitScoutingEntry({
          eventKey: setup.eventKey,
          teamKey: selectedTeam.key,
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
