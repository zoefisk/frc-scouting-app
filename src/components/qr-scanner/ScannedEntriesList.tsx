import React from "react";
import { Stack, Typography } from "@mui/material";
import type { ScannedEntry } from "@/old-lib/qr-scanner/types";
import ScannedEntryCard from "@/components/qr-scanner/ScannedEntryCard";

type Props = {
  entries: ScannedEntry[];
  effectiveOnline: boolean;
  onSavedEntry?: (scanId: string) => void;
};

export default function ScannedEntriesList({
  entries,
  effectiveOnline,
  onSavedEntry,
}: Props) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Scanned Entries ({entries.length})</Typography>

      {entries.length === 0 ? (
        <Typography color="text.secondary">
          No QR entries scanned yet.
        </Typography>
      ) : (
        entries.map((entry) => (
          <ScannedEntryCard
            key={entry.scanId}
            entry={entry}
            effectiveOnline={effectiveOnline}
            onSaved={() => onSavedEntry?.(entry.scanId)}
          />
        ))
      )}
    </Stack>
  );
}
