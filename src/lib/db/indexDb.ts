"use client";

import { openDB, type IDBPDatabase } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;
const DB_NAME = "frc-scouting-db";
const DB_VERSION = 2;

export function getDb() {
    if (typeof window === "undefined") {
        throw new Error("IndexedDB is only available in the browser.");
    }

    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("eventTeams")) {
                    db.createObjectStore("eventTeams");
                }

                if (!db.objectStoreNames.contains("eventMatches")) {
                    db.createObjectStore("eventMatches");
                }

                if (!db.objectStoreNames.contains("eventRankings")) {
                    db.createObjectStore("eventRankings");
                }

                if (!db.objectStoreNames.contains("yearEvents")) {
                    db.createObjectStore("yearEvents");
                }

                if (!db.objectStoreNames.contains("offlineEvents")) {
                    db.createObjectStore("offlineEvents", { keyPath: "eventKey" });
                }

                if (!db.objectStoreNames.contains("submissions")) {
                    db.createObjectStore("submissions", { keyPath: "submissionId" });
                }

                if (!db.objectStoreNames.contains("scannedEntries")) {
                    db.createObjectStore("scannedEntries", { keyPath: "scanId" });
                }

                if (!db.objectStoreNames.contains("appSettings")) {
                    db.createObjectStore("appSettings");
                }
            },
        });
    }

    return dbPromise;
}

export type OfflineEventRecord = {
    eventKey: string;
    eventName: string;
    year: number;
    downloadedAt: string;
    lastUpdatedAt: string;
};

export async function saveEventTeams(eventKey: string, teams: unknown) {
    const db = await getDb();
    await db.put("eventTeams", teams, eventKey);
}

export async function getEventTeams<T>(eventKey: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("eventTeams", eventKey);
}

export async function deleteEventTeams(eventKey: string) {
    const db = await getDb();
    await db.delete("eventTeams", eventKey);
}

export async function saveEventMatches(eventKey: string, matches: unknown) {
    const db = await getDb();
    await db.put("eventMatches", matches, eventKey);
}

export async function getEventMatches<T>(eventKey: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("eventMatches", eventKey);
}

export async function deleteEventMatches(eventKey: string) {
    const db = await getDb();
    await db.delete("eventMatches", eventKey);
}

export async function saveEventRankings(eventKey: string, rankings: unknown) {
    const db = await getDb();
    await db.put("eventRankings", rankings, eventKey);
}

export async function getEventRankings<T>(eventKey: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("eventRankings", eventKey);
}

export async function deleteEventRankings(eventKey: string) {
    const db = await getDb();
    await db.delete("eventRankings", eventKey);
}

export async function saveYearEvents(year: string, events: unknown) {
    const db = await getDb();
    await db.put("yearEvents", events, year);
}

export async function getYearEvents<T>(year: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("yearEvents", year);
}

export async function saveOfflineEvent(record: OfflineEventRecord) {
    const db = await getDb();
    await db.put("offlineEvents", record);
}

export async function getOfflineEvents<T = OfflineEventRecord[]>(): Promise<T> {
    const db = await getDb();
    return (await db.getAll("offlineEvents")) as T;
}

export async function removeOfflineEvent(eventKey: string) {
    const db = await getDb();

    await Promise.all([
        db.delete("offlineEvents", eventKey),
        db.delete("eventTeams", eventKey),
        db.delete("eventMatches", eventKey),
        db.delete("eventRankings", eventKey),
    ]);
}

export async function saveSubmission(submission: {
    submissionId: string;
    [key: string]: unknown;
}) {
    const db = await getDb();
    await db.put("submissions", submission);
}

export async function getSubmissions<T = any[]>(): Promise<T> {
    const db = await getDb();
    return (await db.getAll("submissions")) as T;
}

export async function deleteSubmission(submissionId: string) {
    const db = await getDb();
    await db.delete("submissions", submissionId);
}

export async function saveScannedEntry(entry: {
    scanId: string;
    [key: string]: unknown;
}) {
    const db = await getDb();
    await db.put("scannedEntries", entry);
}

export async function getScannedEntries<T = any[]>(): Promise<T> {
    const db = await getDb();
    return (await db.getAll("scannedEntries")) as T;
}

export async function deleteScannedEntry(scanId: string) {
    const db = await getDb();
    await db.delete("scannedEntries", scanId);
}

export async function saveAppSetting(key: string, value: unknown) {
    const db = await getDb();
    await db.put("appSettings", value, key);
}

export async function getAppSetting<T>(key: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("appSettings", key);
}
