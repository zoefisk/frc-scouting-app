"use client";

import { getDb, type PendingSubmission } from "@/old-lib/db/indexDb";

export async function saveSubmission(submission: PendingSubmission) {
  const db = await getDb();
  await db.put("submissions", submission);
}

export async function getSubmissions<T = PendingSubmission>() {
  const db = await getDb();
  return db.getAll("submissions") as Promise<T[]>;
}

export async function deleteSubmission(submissionId: string) {
  const db = await getDb();
  await db.delete("submissions", submissionId);
}
