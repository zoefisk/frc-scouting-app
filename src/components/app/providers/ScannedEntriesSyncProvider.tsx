"use client";

import React from "react";

import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import type { ScannedEntry } from "@/lib/qr-scanner/types";
import {
  buildImportedQuestionnaireDuplicateKey,
  normalizeImportedQuestionnaireText,
  uploadImportedQuestionnairePayload,
} from "@/lib/scan/importQuestionnairePayload";
import { deleteScannedEntry, getScannedEntries } from "@/lib/db/scans";

type ParsedQueueEntry = {
  entry: ScannedEntry;
  duplicateKey: string;
};

export default function ScannedEntriesSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { effectiveOnline } = useSyncMode();
  const toast = useToast();
  const isSyncingRef = React.useRef(false);

  const syncQueuedScannedEntries = React.useCallback(async () => {
    if (isSyncingRef.current || !effectiveOnline) {
      return;
    }

    isSyncingRef.current = true;
    let syncedCount = 0;

    try {
      const savedEntries = await getScannedEntries<ScannedEntry>();
      const parsedEntries: ParsedQueueEntry[] = [];
      const duplicateCounts = new Map<string, number>();

      for (const entry of savedEntries) {
        try {
          const payload = await normalizeImportedQuestionnaireText(
            entry.rawText,
            entry.fallbackProjectId ?? undefined
          );
          const duplicateKey = buildImportedQuestionnaireDuplicateKey(payload);
          duplicateCounts.set(
            duplicateKey,
            (duplicateCounts.get(duplicateKey) ?? 0) + 1
          );
          parsedEntries.push({ entry, duplicateKey });
        } catch (error) {
          console.error("Skipping invalid scanned queue entry:", error);
        }
      }

      for (const parsedEntry of parsedEntries) {
        if ((duplicateCounts.get(parsedEntry.duplicateKey) ?? 0) > 1) {
          continue;
        }

        try {
          const payload = await normalizeImportedQuestionnaireText(
            parsedEntry.entry.rawText,
            parsedEntry.entry.fallbackProjectId ?? undefined
          );
          await uploadImportedQuestionnairePayload(payload);
          await deleteScannedEntry(parsedEntry.entry.scanId);
          syncedCount += 1;
        } catch (error) {
          console.error(
            `Failed to sync scanned entry ${parsedEntry.entry.scanId}:`,
            error
          );
        }
      }

      if (syncedCount > 0) {
        toast.success(
          syncedCount === 1
            ? "Uploaded 1 scanned scouting entry after reconnecting."
            : `Uploaded ${syncedCount} scanned scouting entries after reconnecting.`
        );
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [effectiveOnline, toast]);

  React.useEffect(() => {
    void syncQueuedScannedEntries();
  }, [syncQueuedScannedEntries]);

  React.useEffect(() => {
    const handleOnline = () => {
      void syncQueuedScannedEntries();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncQueuedScannedEntries]);

  return <>{children}</>;
}
