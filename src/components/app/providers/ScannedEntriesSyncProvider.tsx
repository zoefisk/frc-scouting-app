"use client";

import React from "react";

import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import type { ScannedEntry } from "@/lib/qr-scanner/types";
import {
  buildImportedQuestionnaireDuplicateKey,
  normalizeImportedQuestionnaireTexts,
  uploadImportedQuestionnairePayload,
} from "@/lib/scan/importQuestionnairePayload";
import { deleteScannedEntry, getScannedEntries } from "@/lib/db/scans";

type ParsedQueueEntry = {
  entry: ScannedEntry;
  payloads: Awaited<ReturnType<typeof normalizeImportedQuestionnaireTexts>>;
  duplicateKeys: string[];
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
          const payloads = await normalizeImportedQuestionnaireTexts(
            entry.rawText,
            entry.fallbackProjectId ?? undefined
          );
          const duplicateKeys = payloads.map((payload) =>
            buildImportedQuestionnaireDuplicateKey(payload)
          );

          for (const duplicateKey of duplicateKeys) {
            duplicateCounts.set(
              duplicateKey,
              (duplicateCounts.get(duplicateKey) ?? 0) + 1
            );
          }

          parsedEntries.push({ entry, payloads, duplicateKeys });
        } catch (error) {
          console.error("Skipping invalid scanned queue entry:", error);
        }
      }

      for (const parsedEntry of parsedEntries) {
        if (
          parsedEntry.duplicateKeys.some(
            (duplicateKey) => (duplicateCounts.get(duplicateKey) ?? 0) > 1
          )
        ) {
          continue;
        }

        try {
          for (const payload of parsedEntry.payloads) {
            await uploadImportedQuestionnairePayload(payload);
          }

          await deleteScannedEntry(parsedEntry.entry.scanId);
          syncedCount += parsedEntry.payloads.length;
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
