import React from "react";
import { Button, Stack } from "@mui/material";

type Props = {
  isScanning: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
};

export default function QrScannerControls({
  isScanning,
  onStart,
  onStop,
  onRefresh,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      {!isScanning ? (
        <Button variant="contained" onClick={onStart}>
          Open Camera
        </Button>
      ) : (
        <Button variant="outlined" onClick={onStop}>
          Stop Camera
        </Button>
      )}

      <Button variant="outlined" onClick={onRefresh}>
        Refresh Saved Entries
      </Button>
    </Stack>
  );
}
