"use client";

import { getDb } from "@/lib/db/indexDb";

export async function saveAppSetting(key: string, value: unknown) {
    const db = await getDb();
    await db.put("appSettings", value, key);
}

export async function getAppSetting<T>(key: string): Promise<T | undefined> {
    const db = await getDb();
    return db.get("appSettings", key);
}
