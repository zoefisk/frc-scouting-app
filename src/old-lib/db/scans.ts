"use client";

import { getDb } from "@/old-lib/db/indexDb";
import { ScannedEntry } from "@/old-lib/qr-scanner/types";

export async function deleteScannedEntry(scanId: string) {
  const db = await getDb();
  await db.delete("scannedEntries", scanId);
}

export async function saveScannedEntry(entry: ScannedEntry) {
  const db = await getDb();
  await db.put("scannedEntries", entry);
}

export async function getScannedEntries<T = ScannedEntry>() {
  const db = await getDb();
  return db.getAll("scannedEntries") as Promise<T[]>;
}

export async function clearScannedEntries() {
  const db = await getDb();
  await db.clear("scannedEntries");
}
