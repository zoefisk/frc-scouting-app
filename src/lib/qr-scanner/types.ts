export type ScannedEntry = {
  scanId: string;
  rawText: string;
  parsedData: Record<string, unknown> | null;
  scannedAt: string;
};
