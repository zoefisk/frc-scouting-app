// src/lib/scouting/match/useMatchScoutingDraft.ts

import React from "react";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
import {
  clearInProgressMatchScoutingDraft,
  loadInProgressMatchScoutingDraft,
  saveInProgressMatchScoutingDraft,
  type InProgressMatchScoutingSnapshot,
} from "@/lib/scouting/match/inProgressMatchScouting";

type Args = {
  questionnaire: QuestionnaireDefinition;
  snapshot: InProgressMatchScoutingSnapshot;
  applyDraft: (snapshot: InProgressMatchScoutingSnapshot) => void;
};

export function useMatchScoutingDraft({
  questionnaire,
  snapshot,
  applyDraft,
}: Args) {
  const [loadedDraft, setLoadedDraft] = React.useState(false);

  const hydratedRef = React.useRef(false);
  const saveTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const draft = loadInProgressMatchScoutingDraft();

    if (
      draft &&
      draft.questionnaireId === questionnaire.id &&
      draft.questionnaireVersion === questionnaire.version
    ) {
      applyDraft(draft.snapshot);
      setLoadedDraft(true);
    }

    hydratedRef.current = true;
  }, [questionnaire.id, questionnaire.version, applyDraft]);

  React.useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    if (saveTimeoutRef.current != null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveInProgressMatchScoutingDraft(questionnaire, snapshot);
    }, 350);

    return () => {
      if (saveTimeoutRef.current != null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questionnaire, snapshot]);

  const clearDraft = React.useCallback(() => {
    clearInProgressMatchScoutingDraft();
  }, []);

  return {
    loadedDraft,
    clearDraft,
  };
}
