"use client";

import { getDb } from "@/lib/db/indexDb";
import { ScannedEntry } from "@/lib/qr-scanner/types";

export const SCANNED_ENTRIES_CHANGED_EVENT = "scanned-entries:changed";

function emitScannedEntriesChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SCANNED_ENTRIES_CHANGED_EVENT));
}

export async function deleteScannedEntry(scanId: string) {
  const db = await getDb();
  await db.delete("scannedEntries", scanId);
  emitScannedEntriesChanged();
}

export async function saveScannedEntry(entry: ScannedEntry) {
  const db = await getDb();
  await db.put("scannedEntries", entry);
  emitScannedEntriesChanged();
}

export async function getScannedEntries<T = ScannedEntry>() {
  const db = await getDb();
  return db.getAll("scannedEntries") as Promise<T[]>;
}

export async function clearScannedEntries() {
  const db = await getDb();
  await db.clear("scannedEntries");
  emitScannedEntriesChanged();
}
