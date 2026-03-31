"use client";

import { openDB, type IDBPDatabase } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
    if (typeof window === "undefined") {
        throw new Error("IndexedDB is only available in the browser.");
    }

    if (!dbPromise) {
        dbPromise = openDB("frc-scouting-db", 3, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("appSettings")) {
                    db.createObjectStore("appSettings");
                }

                if (!db.objectStoreNames.contains("eventTeams")) {
                    db.createObjectStore("eventTeams");
                }

                if (!db.objectStoreNames.contains("eventMatches")) {
                    db.createObjectStore("eventMatches");
                }

                if (!db.objectStoreNames.contains("submissions")) {
                    db.createObjectStore("submissions", { keyPath: "submissionId" });
                }

                if (!db.objectStoreNames.contains("scannedEntries")) {
                    db.createObjectStore("scannedEntries", { keyPath: "scanId" });
                }
            },
        });
    }

    return dbPromise;
}

export async function saveEventTeams(eventKey: string, teams: unknown) {
    const db = await getDb();
    await db.put("eventTeams", teams, eventKey);
}

export async function getEventTeams<T>(
    eventKey: string
): Promise<T | undefined> {
    const db = await getDb();
    return db.get("eventTeams", eventKey);
}

export async function saveEventMatches(eventKey: string, matches: unknown) {
    const db = await getDb();
    await db.put("eventMatches", matches, eventKey);
}

export async function getEventMatches<T>(
    eventKey: string
): Promise<T | undefined> {
    const db = await getDb();
    return db.get("eventMatches", eventKey);
}

export async function saveSubmission(submission: {
    submissionId: string;
    [key: string]: unknown;
}) {
    const db = await getDb();
    await db.put("submissions", submission);
}

export async function saveScannedEntry(entry: {
    scanId: string;
    rawText: string;
    parsedData: Record<string, unknown> | null;
    scannedAt: string;
}) {
    const db = await getDb();
    await db.put("scannedEntries", entry);
}

export async function getScannedEntries<T>() {
    const db = await getDb();
    return db.getAll("scannedEntries") as Promise<T[]>;
}

export async function clearScannedEntries() {
    const db = await getDb();
    await db.clear("scannedEntries");
}

export async function getSubmissions<T>() {
    const db = await getDb();
    return db.getAll("submissions") as Promise<T[]>;
}

export async function deleteSubmission(submissionId: string) {
    const db = await getDb();
    await db.delete("submissions", submissionId);
}

export async function saveAppSetting(key: string, value: unknown) {
    const db = await getDb();
    await db.put("appSettings", value, key);
}

export async function getAppSetting<T>(key: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("appSettings", key);
}
