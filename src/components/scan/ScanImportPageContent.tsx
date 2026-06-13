"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import { buildScannedEntry } from "@/lib/qr-scanner/buildScannedEntry";
import {
  SCANNED_ENTRIES_CHANGED_EVENT,
  deleteScannedEntry,
  getScannedEntries,
  saveScannedEntry,
} from "@/lib/db/scans";
import type { ScannedEntry } from "@/lib/qr-scanner/types";
import {
  buildImportedQuestionnaireDuplicateKey,
  normalizeImportedQuestionnaireTexts,
  type ImportedQuestionnairePayload,
  uploadImportedQuestionnairePayload,
} from "@/lib/scan/importQuestionnairePayload";

type ImportedQueueItem = {
  entry: ScannedEntry;
  payload: ImportedQuestionnairePayload | null;
  error: string | null;
  duplicateKey: string | null;
  duplicateCount: number;
};

type Props = {
  defaultProjectId?: string;
  projectName?: string;
};

function EntryCard({
  item,
  onUpload,
  onDelete,
  uploading,
}: {
  item: ImportedQueueItem;
  onUpload: () => void;
  onDelete: () => void;
  uploading: boolean;
}) {
  const payload = item.payload;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                label={payload ? payload.setup.kind.toUpperCase() : "INVALID"}
                color={payload ? "primary" : "default"}
              />
              {payload ? <Chip size="small" label={payload.eventKey} /> : null}
              {payload?.projectId ? (
                <Chip size="small" label={`Project ${payload.projectId}`} />
              ) : null}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {new Date(item.entry.scannedAt).toLocaleString()}
            </Typography>
          </Stack>

          {payload ? (
            <Stack spacing={0.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {payload.questionnaire.name}
                </Typography>
                {item.duplicateCount > 1 ? (
                  <Chip
                    size="small"
                    color="warning"
                    label={`Duplicate in queue (${item.duplicateCount})`}
                  />
                ) : null}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {payload.setup.kind === "match"
                  ? `Match ${payload.matchNumber ?? "-"} • ${payload.scoutingPosition ?? "No position"} • #${payload.teamNumber ?? "-"} ${payload.teamName}`
                  : `#${payload.teamNumber ?? "-"} ${payload.teamName}`}
              </Typography>
            </Stack>
          ) : (
            <Alert severity="warning">
              {item.error ?? "Could not parse this import."}
            </Alert>
          )}

          {item.duplicateCount > 1 ? (
            <Alert severity="warning">
              This entry already exists elsewhere in the import queue. Remove
              the duplicate before uploading.
            </Alert>
          ) : null}

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 2,
              overflowX: "auto",
              backgroundColor: "rgba(15,23,42,0.04)",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {item.entry.rawText}
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={onUpload}
              disabled={!payload || uploading || item.duplicateCount > 1}
            >
              {uploading ? "Uploading..." : "Upload to Cloud"}
            </Button>

            {payload?.projectId ? (
              <Link
                href={`/scouting-projects/${payload.projectId}`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="outlined">Open Project</Button>
              </Link>
            ) : null}

            <Button
              variant="text"
              color="inherit"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={onDelete}
              disabled={uploading}
            >
              Remove
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ScanImportPageContent({
  defaultProjectId,
  projectName,
}: Props) {
  const toast = useToast();
  const { effectiveOnline } = useSyncMode();

  const [items, setItems] = React.useState<ImportedQueueItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pasteValue, setPasteValue] = React.useState("");
  const [scannerError, setScannerError] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(false);
  const [uploadingIds, setUploadingIds] = React.useState<string[]>([]);

  const scannerRef = React.useRef<{
    stop: () => Promise<void>;
    clear: () => Promise<void> | void;
    isScanning?: boolean;
  } | null>(null);
  const recentScanRef = React.useRef<Set<string>>(new Set());
  const regionId = "qr-reader-region";

  const loadQueue = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await getScannedEntries<ScannedEntry>();

      const normalizedItems = await Promise.all(
        [...saved]
          .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt))
          .map(async (entry) => {
            try {
              const payload = (
                await normalizeImportedQuestionnaireTexts(
                  entry.rawText,
                  entry.fallbackProjectId ?? defaultProjectId
                )
              )[0];

              if (!payload) {
                throw new Error(
                  "Imported entry did not contain a scouting payload."
                );
              }

              return { entry, payload, error: null, duplicateKey: null };
            } catch (error) {
              return {
                entry,
                payload: null,
                error:
                  error instanceof Error
                    ? error.message
                    : "Could not parse imported entry.",
                duplicateKey: null,
              };
            }
          })
      );

      const duplicateCounts = normalizedItems.reduce((counts, item) => {
        if (!item.payload) {
          return counts;
        }

        const duplicateKey = buildImportedQuestionnaireDuplicateKey(
          item.payload
        );
        counts.set(duplicateKey, (counts.get(duplicateKey) ?? 0) + 1);
        return counts;
      }, new Map<string, number>());

      const nextItems = normalizedItems.map((item) => {
        if (!item.payload) {
          return {
            ...item,
            duplicateKey: null,
            duplicateCount: 0,
          };
        }

        const duplicateKey = buildImportedQuestionnaireDuplicateKey(
          item.payload
        );

        return {
          ...item,
          duplicateKey,
          duplicateCount: duplicateCounts.get(duplicateKey) ?? 1,
        };
      });

      setItems(nextItems);
    } catch (error) {
      console.error("Failed to load import queue:", error);
      toast.error("Could not load imported scouting entries.");
    } finally {
      setIsLoading(false);
    }
  }, [defaultProjectId, toast]);

  React.useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  React.useEffect(() => {
    function handleScannedEntriesChanged() {
      void loadQueue();
    }

    window.addEventListener(
      SCANNED_ENTRIES_CHANGED_EVENT,
      handleScannedEntriesChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        SCANNED_ENTRIES_CHANGED_EVENT,
        handleScannedEntriesChanged as EventListener
      );
    };
  }, [loadQueue]);

  const stopScanner = React.useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear();
    } catch (error) {
      console.error("Failed to stop scanner:", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const saveRawImportText = React.useCallback(
    async (rawText: string) => {
      const payloads = await normalizeImportedQuestionnaireTexts(
        rawText,
        defaultProjectId
      );

      if (payloads.length === 0) {
        throw new Error("Import did not contain any scouting entries.");
      }

      const duplicateKeys = payloads.map((payload) =>
        buildImportedQuestionnaireDuplicateKey(payload)
      );
      const saved = await getScannedEntries<ScannedEntry>();

      for (const savedEntry of saved) {
        try {
          const savedPayloads = await normalizeImportedQuestionnaireTexts(
            savedEntry.rawText,
            savedEntry.fallbackProjectId ?? defaultProjectId
          );

          for (const savedPayload of savedPayloads) {
            if (
              duplicateKeys.includes(
                buildImportedQuestionnaireDuplicateKey(savedPayload)
              )
            ) {
              throw new Error(
                "That scouting entry is already in the import queue."
              );
            }
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message ===
              "That scouting entry is already in the import queue."
          ) {
            throw error;
          }
        }
      }

      for (const payload of payloads) {
        await saveScannedEntry(
          buildScannedEntry(JSON.stringify(payload), {
            fallbackProjectId: defaultProjectId ?? null,
          })
        );
      }

      await loadQueue();
      return payloads.length;
    },
    [defaultProjectId, loadQueue]
  );

  const handleDecodedText = React.useCallback(
    async (decodedText: string) => {
      if (recentScanRef.current.has(decodedText)) {
        return;
      }

      recentScanRef.current.add(decodedText);
      window.setTimeout(() => {
        recentScanRef.current.delete(decodedText);
      }, 2500);

      const importedCount = await saveRawImportText(decodedText);
      toast.success(
        importedCount === 1
          ? "Scouting QR imported into the queue."
          : `Scouting QR imported ${importedCount} entries into the queue.`
      );
    },
    [saveRawImportText, toast]
  );

  const startScanner = React.useCallback(async () => {
    setScannerError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1,
        },
        async (decodedText: string) => {
          await handleDecodedText(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Failed to start QR scanner:", error);
      setScannerError("Could not start the camera scanner.");
      setIsScanning(false);
    }
  }, [handleDecodedText]);

  const handlePasteImport = React.useCallback(async () => {
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      toast.warning("Paste QR text or CSV contents first.");
      return;
    }

    try {
      const importedCount = await saveRawImportText(trimmed);
      setPasteValue("");
      toast.success(
        importedCount === 1
          ? "Imported pasted scouting entry into the queue."
          : `Imported ${importedCount} pasted scouting entries into the queue.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not import pasted scouting data.");
    }
  }, [pasteValue, saveRawImportText, toast]);

  const handleCsvFilesSelected = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length === 0) {
        return;
      }

      try {
        let importedCount = 0;
        for (const file of files) {
          const text = await file.text();
          importedCount += await saveRawImportText(text);
        }

        toast.success(
          importedCount === 1
            ? "Imported 1 scouting entry from CSV into the queue."
            : `Imported ${importedCount} scouting entries from CSV into the queue.`
        );
      } catch (error) {
        console.error(error);
        toast.error("Could not import one or more CSV files.");
      } finally {
        event.target.value = "";
      }
    },
    [saveRawImportText, toast]
  );

  const handleDelete = React.useCallback(async (scanId: string) => {
    await deleteScannedEntry(scanId);
    setItems((prev) => prev.filter((item) => item.entry.scanId !== scanId));
  }, []);

  const handleUploadOne = React.useCallback(
    async (item: ImportedQueueItem) => {
      if (!item.payload) {
        toast.warning("This entry could not be parsed.");
        return;
      }

      if (item.duplicateCount > 1) {
        toast.warning("Remove duplicate entries before uploading.");
        return;
      }

      if (!effectiveOnline) {
        toast.warning("Go online before uploading to the cloud.");
        return;
      }

      try {
        setUploadingIds((prev) => [...prev, item.entry.scanId]);
        await uploadImportedQuestionnairePayload(item.payload);
        await deleteScannedEntry(item.entry.scanId);
        setItems((prev) =>
          prev.filter((entry) => entry.entry.scanId !== item.entry.scanId)
        );
        toast.success("Uploaded scouting entry to cloud.");
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not upload scouting entry."
        );
      } finally {
        setUploadingIds((prev) =>
          prev.filter((id) => id !== item.entry.scanId)
        );
      }
    },
    [effectiveOnline, toast]
  );

  const handleUploadAll = React.useCallback(async () => {
    const uploadableItems = items.filter(
      (item) => item.payload && item.duplicateCount <= 1
    );
    if (uploadableItems.length === 0) {
      toast.warning(
        "There are no valid non-duplicate imported entries to upload."
      );
      return;
    }

    for (const item of uploadableItems) {
      await handleUploadOne(item);
    }
  }, [handleUploadOne, items, toast]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scan QR / Import CSV
        </Typography>
        <Typography color="text.secondary">
          Import match scouting or pit scouting responses from QR codes, pasted
          transfer text, or exported CSV files, then upload them to the cloud.
        </Typography>
        {projectName ? (
          <Typography variant="body2" color="text.secondary">
            This import queue is currently focused on {projectName}.
          </Typography>
        ) : null}
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <QrCode2OutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                QR Scanner
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Use the camera to scan scouting transfer QR codes directly into
              the import queue.
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {!isScanning ? (
                <Button
                  variant="contained"
                  startIcon={<CameraAltOutlinedIcon />}
                  onClick={() => void startScanner()}
                >
                  Open Camera
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => void stopScanner()}>
                  Stop Camera
                </Button>
              )}
            </Stack>

            {scannerError ? (
              <Alert severity="warning">{scannerError}</Alert>
            ) : null}

            <Box
              id={regionId}
              sx={{
                minHeight: 260,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                backgroundColor: "rgba(15,23,42,0.02)",
              }}
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <UploadFileOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Paste or Upload
              </Typography>
            </Stack>

            <TextField
              multiline
              minRows={7}
              label="QR JSON or CSV text"
              value={pasteValue}
              onChange={(event) => setPasteValue(event.target.value)}
              placeholder="Paste the scouting QR payload or the contents of an exported CSV file."
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={() => void handlePasteImport()}
              >
                Import Pasted Text
              </Button>

              <Button variant="outlined" component="label">
                Import CSV Files
                <input
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  multiple
                  onChange={(event) => void handleCsvFilesSelected(event)}
                />
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Divider />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Import Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Imported entries stay here until you upload them to the cloud.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => void handleUploadAll()}
            disabled={
              !effectiveOnline ||
              items.every((item) => !item.payload || item.duplicateCount > 1)
            }
          >
            Upload All
          </Button>
        </Stack>
      </Stack>

      {!effectiveOnline ? (
        <Alert severity="info">
          You can still scan and queue entries while offline, then upload once
          you are back online.
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography color="text.secondary">
            Loading imported scouting entries...
          </Typography>
        </Stack>
      ) : items.length === 0 ? (
        <Alert severity="info">
          No imported scouting entries yet. Scan a QR code, paste transfer text,
          or import CSV files to get started.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => (
            <EntryCard
              key={item.entry.scanId}
              item={item}
              uploading={uploadingIds.includes(item.entry.scanId)}
              onUpload={() => void handleUploadOne(item)}
              onDelete={() => void handleDelete(item.entry.scanId)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
