"use client";

import React from "react";
import { getSubmissions, deleteSubmission } from "@/lib/db/indexDb";
import { useSyncMode } from "@/components/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import { saveMatchScoutingEntry } from "@/lib/firebase/client/entries";

type Props = {
  children: React.ReactNode;
};

type PendingSubmission = {
  submissionId: string;
  eventKey: string;
  matchNumber: string | number;
  payload: Record<string, unknown>;
};

export default function SubmissionSyncProvider({ children }: Props) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { effectiveOnline } = useSyncMode();
  const toast = useToast();

  const isSyncingRef = React.useRef(false);

  const syncPendingSubmissions = React.useCallback(async () => {
    if (isSyncingRef.current) return;
    if (!effectiveOnline) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    let syncedCount = 0;

    try {
      const pending = await getSubmissions<PendingSubmission[]>();

      for (const submission of pending) {
        try {
          await saveMatchScoutingEntry({
            eventKey: submission.eventKey,
            matchNumber: Number(submission.matchNumber),
            entryId: submission.submissionId,
            payload: submission.payload,
          });

          // TODO: Before deleting locally, check Firebase in case this same
          // scouting entry was already uploaded another way (for example by QR import
          // or CSV import) and avoid creating duplicates.

          await deleteSubmission(submission.submissionId);
          syncedCount += 1;
        } catch (error) {
          console.error(
            `Failed to sync submission ${submission.submissionId}:`,
            error
          );
        }
      }

      console.log("syncedCount:", syncedCount);

      if (syncedCount > 0) {
        toast.success(
          syncedCount === 1
            ? "Successfully transferred local scouting data to cloud."
            : `Successfully transferred ${syncedCount} local scouting entries to cloud.`
        );
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [effectiveOnline, toast]);

  React.useEffect(() => {
    syncPendingSubmissions();
  }, [syncPendingSubmissions]);

  React.useEffect(() => {
    const handleOnline = () => {
      syncPendingSubmissions();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingSubmissions]);

  return <>{children}</>;
}
