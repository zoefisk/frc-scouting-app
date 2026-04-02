"use client";

import React from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";

import { useSyncMode } from "@/components/providers/SyncModeProvider";
import {
  deleteScannedEntry,
  getScannedEntries,
  saveScannedEntry,
} from "../../lib/db";
import { buildScannedEntry } from "@/lib/qr-scanner/buildScannedEntry";
import type { ScannedEntry } from "@/lib/qr-scanner/types";

import QrScannerControls from "@/components/qr-scanner/QrScannerControls";
import QrScannerViewport from "@/components/qr-scanner/QrScannerViewport";
import ScannedEntriesList from "@/components/qr-scanner/ScannedEntriesList";
import PageShell from "@/components/layout/PageShell";

export default function QrScannerPage() {
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const recentScanRef = React.useRef<Set<string>>(new Set());

  const [isScanning, setIsScanning] = React.useState(false);
  const [entries, setEntries] = React.useState<ScannedEntry[]>([]);
  const [error, setError] = React.useState("");

  const { effectiveOnline } = useSyncMode();

  const regionId = "qr-reader-region";

  const loadSavedEntries = React.useCallback(async () => {
    try {
      const saved = await getScannedEntries<ScannedEntry[]>();
      const sorted = [...saved].sort((a, b) =>
        b.scannedAt.localeCompare(a.scannedAt)
      );
      setEntries(sorted);
    } catch (err) {
      console.error("Failed to load scanned entries:", err);
    }
  }, []);

  React.useEffect(() => {
    loadSavedEntries();
  }, [loadSavedEntries]);

  const stopScanner = React.useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear();
    } catch (err) {
      console.error("Error stopping scanner:", err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleDecodedText = React.useCallback(async (decodedText: string) => {
    if (recentScanRef.current.has(decodedText)) {
      return;
    }

    recentScanRef.current.add(decodedText);
    setTimeout(() => {
      recentScanRef.current.delete(decodedText);
    }, 2500);

    const entry = buildScannedEntry(decodedText);

    try {
      await saveScannedEntry(entry);
      setEntries((prev) => [entry, ...prev]);
    } catch (err) {
      console.error("Failed to save scanned entry:", err);
      setError("Scanned successfully, but failed to save locally.");
    }
  }, []);

  const handleSavedEntry = React.useCallback(async (scanId: string) => {
    try {
      await deleteScannedEntry(scanId);
      setEntries((prev) => prev.filter((entry) => entry.scanId !== scanId));
    } catch (err) {
      console.error("Failed to delete scanned entry:", err);
      setError("Saved successfully, but failed to remove scanned entry.");
    }
  }, []);

  const startScanner = React.useCallback(async () => {
    setError("");

    if (
      typeof window === "undefined" ||
      !window.isSecureContext ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setError(
        "Camera access requires Chrome on localhost or HTTPS with camera permissions enabled."
      );
      return;
    }

    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      testStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("getUserMedia test failed:", err);
      setError(
        "Camera permission failed, camera is busy, or no camera is available."
      );
      return;
    }

    try {
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await handleDecodedText(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setError("Could not start camera scanner.");
      setIsScanning(false);
    }
  }, [handleDecodedText]);

  React.useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <PageShell>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scan QR Code
        </Typography>

        <Typography color="text.secondary">
          Scan multiple scouting QR codes. Each successful scan will be saved
          locally.
        </Typography>

        <QrScannerControls
          isScanning={isScanning}
          onStart={startScanner}
          onStop={stopScanner}
          onRefresh={loadSavedEntries}
        />

        {error && <Alert severity="warning">{error}</Alert>}

        <QrScannerViewport regionId={regionId} />

        <ScannedEntriesList
          entries={entries}
          effectiveOnline={effectiveOnline}
          onSavedEntry={handleSavedEntry}
        />
      </Stack>
    </PageShell>
  );
}
