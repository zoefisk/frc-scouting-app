"use client";

import { openDB, type IDBPDatabase } from "idb";

export const DB_NAME = "frc-scouting-db";
export const DB_VERSION = 3;

export type AppSettingValue = unknown;

export type PendingSubmission = {
    submissionId: string;
    [key: string]: unknown;
};

export type ScannedEntry = {
    scanId: string;
    rawText: string;
    parsedData: Record<string, unknown> | null;
    scannedAt: string;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb() {
    if (typeof window === "undefined") {
        throw new Error("IndexedDB is only available in the browser.");
    }

    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
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
