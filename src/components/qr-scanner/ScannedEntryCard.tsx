// import React from "react";
// import { Box, Paper, Stack, Typography } from "@mui/material";
// import { parseScannedMatchPayload } from "@/components/match-scouting/parseScannedMatchPayload";
// import ScoutingActionBar from "@/components/match-scouting/actions/ScoutingActionBar";
// import type { ScannedEntry } from "@/lib/qr-scanner/types";
//
// type Props = {
//   entry: ScannedEntry;
//   effectiveOnline: boolean;
//   onSaved?: () => void;
// };
//
// export default function ScannedEntryCard({
//   entry,
//   effectiveOnline,
//   onSaved,
// }: Props) {
//   const payload = parseScannedMatchPayload(entry.parsedData);
//
//   return (
//     <Paper variant="outlined" sx={{ p: 2 }}>
//       <Stack spacing={1.5}>
//         <Typography variant="body2" color="text.secondary">
//           Scanned at: {new Date(entry.scannedAt).toLocaleString()}
//         </Typography>
//
//         <Box
//           component="pre"
//           sx={{
//             m: 0,
//             p: 2,
//             borderRadius: 2,
//             overflowX: "auto",
//             backgroundColor: "rgba(0,0,0,0.04)",
//             fontSize: "0.9rem",
//             whiteSpace: "pre-wrap",
//             wordBreak: "break-word",
//           }}
//         >
//           {entry.parsedData
//             ? JSON.stringify(entry.parsedData, null, 2)
//             : entry.rawText}
//         </Box>
//
//         {payload && (
//           <ScoutingActionBar
//             effectiveOnline={effectiveOnline}
//             payload={payload}
//             onSuccess={onSaved}
//           />
//         )}
//       </Stack>
//     </Paper>
//   );
// }
