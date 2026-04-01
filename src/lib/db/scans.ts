"use client";

import { getDb, type ScannedEntry } from "@/lib/db/indexDb";

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
