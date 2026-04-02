import type { ScannedEntry } from "@/lib/qr-scanner/types";

export function buildScannedEntry(decodedText: string): ScannedEntry {
  let parsedData: Record<string, unknown> | null = null;

  try {
    parsedData = JSON.parse(decodedText) as Record<string, unknown>;
  } catch {
    parsedData = null;
  }

  return {
    scanId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    rawText: decodedText,
    parsedData,
    scannedAt: new Date().toISOString(),
  };
}
