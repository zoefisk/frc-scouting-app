// "use client";
//
// import React from "react";
// import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
// import { Html5Qrcode } from "html5-qrcode";
// // import { getScannedEntries, saveScannedEntry } from "@/lib/db/indexDb";
// // import { parseScannedMatchPayload } from "@/components/match-scouting/parseScannedMatchPayload";
// // import ScoutingActionBar from "@/components/match-scouting/actions/ScoutingActionBar";
// import { useSyncMode } from "@/components/providers/SyncModeProvider";
// import { getScannedEntries, saveScannedEntry } from "@/lib/db";
//
// type ScannedEntry = {
//   scanId: string;
//   rawText: string;
//   parsedData: Record<string, unknown> | null;
//   scannedAt: string;
// };
//
// export default function QrScannerPage() {
//   const scannerRef = React.useRef<Html5Qrcode | null>(null);
//   const recentScanRef = React.useRef<Set<string>>(new Set());
//
//   const [isScanning, setIsScanning] = React.useState(false);
//   const [entries, setEntries] = React.useState<ScannedEntry[]>([]);
//   const [error, setError] = React.useState("");
//
//   const { effectiveOnline } = useSyncMode();
//
//   const regionId = "qr-reader-region";
//
//   const loadSavedEntries = React.useCallback(async () => {
//     try {
//       const saved = await getScannedEntries<ScannedEntry[]>();
//       const sorted = [...saved].sort((a, b) =>
//         b.scannedAt.localeCompare(a.scannedAt)
//       );
//       setEntries(sorted);
//     } catch (err) {
//       console.error("Failed to load scanned entries:", err);
//     }
//   }, []);
//
//   React.useEffect(() => {
//     loadSavedEntries();
//   }, [loadSavedEntries]);
//
//   const stopScanner = React.useCallback(async () => {
//     try {
//       if (scannerRef.current?.isScanning) {
//         await scannerRef.current.stop();
//       }
//       await scannerRef.current?.clear();
//     } catch (err) {
//       console.error("Error stopping scanner:", err);
//     } finally {
//       setIsScanning(false);
//     }
//   }, []);
//
//   const handleDecodedText = React.useCallback(async (decodedText: string) => {
//     if (recentScanRef.current.has(decodedText)) {
//       return;
//     }
//
//     recentScanRef.current.add(decodedText);
//     setTimeout(() => {
//       recentScanRef.current.delete(decodedText);
//     }, 2500);
//
//     let parsedData: Record<string, unknown> | null = null;
//
//     try {
//       parsedData = JSON.parse(decodedText) as Record<string, unknown>;
//     } catch {
//       parsedData = null;
//     }
//
//     const entry: ScannedEntry = {
//       scanId:
//         typeof crypto !== "undefined" && "randomUUID" in crypto
//           ? crypto.randomUUID()
//           : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
//       rawText: decodedText,
//       parsedData,
//       scannedAt: new Date().toISOString(),
//     };
//
//     try {
//       await saveScannedEntry(entry);
//       setEntries((prev) => [entry, ...prev]);
//     } catch (err) {
//       console.error("Failed to save scanned entry:", err);
//       setError("Scanned successfully, but failed to save locally.");
//     }
//   }, []);
//
//   const startScanner = React.useCallback(async () => {
//     setError("");
//
//     if (
//       typeof window === "undefined" ||
//       !window.isSecureContext ||
//       !navigator.mediaDevices ||
//       !navigator.mediaDevices.getUserMedia
//     ) {
//       setError(
//         "Camera access requires Chrome on localhost or HTTPS with camera permissions enabled."
//       );
//       return;
//     }
//
//     try {
//       const testStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//       });
//       testStream.getTracks().forEach((track) => track.stop());
//     } catch (err) {
//       console.error("getUserMedia test failed:", err);
//       setError(
//         "Camera permission failed, camera is busy, or no camera is available."
//       );
//       return;
//     }
//
//     try {
//       const scanner = new Html5Qrcode(regionId);
//       scannerRef.current = scanner;
//
//       await scanner.start(
//         { facingMode: "environment" },
//         {
//           fps: 10,
//           qrbox: { width: 260, height: 260 },
//           aspectRatio: 1,
//         },
//         async (decodedText) => {
//           await handleDecodedText(decodedText);
//         },
//         () => {}
//       );
//
//       setIsScanning(true);
//     } catch (err) {
//       console.error(err);
//       setError("Could not start camera scanner.");
//       setIsScanning(false);
//     }
//   }, [handleDecodedText]);
//
//   React.useEffect(() => {
//     return () => {
//       stopScanner();
//     };
//   }, [stopScanner]);
//
//   return (
//     <Stack spacing={3}>
//       <Typography variant="h4" sx={{ fontWeight: 700 }}>
//         Scan QR Code
//       </Typography>
//
//       <Typography color="text.secondary">
//         Scan multiple scouting QR codes. Each successful scan will be saved
//         locally.
//       </Typography>
//
//       <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
//         {!isScanning ? (
//           <Button variant="contained" onClick={startScanner}>
//             Open Camera
//           </Button>
//         ) : (
//           <Button variant="outlined" onClick={stopScanner}>
//             Stop Camera
//           </Button>
//         )}
//
//         <Button variant="outlined" onClick={loadSavedEntries}>
//           Refresh Saved Entries
//         </Button>
//       </Stack>
//
//       {error && <Alert severity="warning">{error}</Alert>}
//
//       <Paper
//         variant="outlined"
//         sx={{
//           p: 2,
//           minHeight: 320,
//         }}
//       >
//         <Box
//           id={regionId}
//           sx={{
//             width: "100%",
//             maxWidth: 420,
//             mx: "auto",
//           }}
//         />
//       </Paper>
//
//       <Stack spacing={2}>
//         <Typography variant="h6">Scanned Entries ({entries.length})</Typography>
//
//         {entries.length === 0 ? (
//           <Typography color="text.secondary">
//             No QR entries scanned yet.
//           </Typography>
//         ) : (
//           entries.map((entry) => (
//             <Paper key={entry.scanId} variant="outlined" sx={{ p: 2 }}>
//               <Stack spacing={1.5}>
//                 <Typography variant="body2" color="text.secondary">
//                   Scanned at: {new Date(entry.scannedAt).toLocaleString()}
//                 </Typography>
//
//                 {(() => {
//                   // const payload = parseScannedMatchPayload(entry.parsedData);
//
//                   return (
//                     <>
//                       <Box
//                         component="pre"
//                         sx={{
//                           m: 0,
//                           p: 2,
//                           borderRadius: 2,
//                           overflowX: "auto",
//                           backgroundColor: "rgba(0,0,0,0.04)",
//                           fontSize: "0.9rem",
//                           whiteSpace: "pre-wrap",
//                           wordBreak: "break-word",
//                         }}
//                       >
//                         {entry.parsedData
//                           ? JSON.stringify(entry.parsedData, null, 2)
//                           : entry.rawText}
//                       </Box>
//
//                       {/*{payload && (*/}
//                       {/*  <ScoutingActionBar*/}
//                       {/*    effectiveOnline={effectiveOnline}*/}
//                       {/*    payload={payload}*/}
//                       {/*  />*/}
//                       {/*)}*/}
//                     </>
//                   );
//                 })()}
//               </Stack>
//             </Paper>
//           ))
//         )}
//       </Stack>
//     </Stack>
//   );
// }

export default function QrScannerPage() {
  return (
    <div>
      <h1>QR Scanner</h1>
      <p>This page is under construction.</p>
    </div>
  );
}
