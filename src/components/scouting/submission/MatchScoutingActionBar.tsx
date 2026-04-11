import React from "react";
import { Stack } from "@mui/material";

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import ScoutingSetupQr from "@/components/scouting/submission/ScoutingSetupQr";
import SaveQuestionnaireLocalButton from "@/components/scouting/submission/SaveQuestionnaireLocalButton";
import SaveQuestionnaireCloudButton from "@/components/scouting/submission/SaveQuestionnaireCloudButton";
import { TeamOption } from "@/lib/scouting/tba/loadEventTeams";
import ScoutingSetupCsvButton from "@/components/scouting/submission/ScoutingSetupCSVButton";

export type ScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3";

export type TeamPresence = "present" | "absent" | "surrogate";

export type MatchSetupState = {
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
  effectiveOnline?: boolean;
  onReset?: () => void;
  onSuccess?: () => void;
};

export default function MatchScoutingActionBar({
  questionnaire,
  answers,
  setup,
  disabled = false,
  effectiveOnline = true,
  onReset,
  onSuccess,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
      <SaveQuestionnaireLocalButton
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={disabled}
        onSuccess={onSuccess}
        onReset={onReset}
      />

      {effectiveOnline && (
        <SaveQuestionnaireCloudButton
          questionnaire={questionnaire}
          answers={answers}
          setup={setup}
          disabled={disabled}
          onSuccess={onSuccess}
          onReset={onReset}
        />
      )}

      <ScoutingSetupCsvButton
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={disabled}
      />

      <ScoutingSetupQr
        questionnaire={questionnaire}
        answers={answers}
        setup={setup}
        disabled={disabled}
      />

      {/*{onReset && <ScoutingResetButton onReset={onReset} />}*/}
    </Stack>
  );
}
