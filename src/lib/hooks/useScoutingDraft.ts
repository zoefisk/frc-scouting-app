import React from "react";
import {
  deleteInProgressSubmission,
  getInProgressSubmission,
  saveInProgressSubmission,
} from "../db";
import { useToast } from "@/lib/hooks/useToast";

type Options<TDraft> = {
  draftId: string;
  draftPayload: TDraft;
  enabled: boolean;
  restoreDraft: (draft: TDraft) => void;
};

export function useScoutingDraft<TDraft extends { draftId: string }>({
  draftId,
  draftPayload,
  enabled,
  restoreDraft,
}: Options<TDraft>) {
  const toast = useToast();
  const restoredDraftRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    async function loadDraft() {
      if (!enabled) return;
      if (!draftId) return;
      if (restoredDraftRef.current === draftId) return;

      try {
        const draft = await getInProgressSubmission<TDraft>(draftId);
        if (!draft) return;

        restoreDraft(draft);
        restoredDraftRef.current = draftId;
        toast.info("Restored in-progress scouting form.");
      } catch (err) {
        console.error("Failed to restore in-progress scouting draft:", err);
      }
    }

    loadDraft();
  }, [draftId, enabled, restoreDraft, toast]);

  React.useEffect(() => {
    if (!enabled) return;
    if (!draftId) return;

    const timeout = window.setTimeout(() => {
      saveInProgressSubmission(draftPayload).catch((err) => {
        console.error("Failed to save in-progress scouting draft:", err);
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draftId, draftPayload, enabled]);

  const clearDraft = React.useCallback(async () => {
    if (!draftId) return;
    await deleteInProgressSubmission(draftId);
  }, [draftId]);

  return {
    clearDraft,
  };
}
