"use client";

import { getDb } from "@/lib/db/indexDb";

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
