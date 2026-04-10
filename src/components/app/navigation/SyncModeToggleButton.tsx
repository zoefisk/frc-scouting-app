"use client";

import React from "react";
import { Button } from "@mui/material";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";

type Props = {
  compact?: boolean;
};

export default function SyncModeToggleButton({ compact = false }: Props) {
  const { actualOnline, syncMode, effectiveOnline, toggleSyncMode } =
    useSyncMode();
  const toast = useToast();

  const disabled = !actualOnline && syncMode === "forced_offline";

  const handleToggle = async () => {
    const goingOffline = syncMode === "online";

    await toggleSyncMode();

    if (goingOffline) {
      toast.info("Cloud sync turned off. Saving locally only.");
    } else {
      toast.success("Cloud sync enabled.");
    }
  };

  return (
    <Button
      variant={effectiveOnline ? "contained" : "outlined"}
      color={effectiveOnline ? "success" : "inherit"}
      onClick={handleToggle}
      disabled={disabled}
      sx={{
        minWidth: compact ? 0 : undefined,
        width: compact ? 48 : "100%",
        px: compact ? 0 : 1.75,
        textTransform: "none",
      }}
    >
      {compact
        ? effectiveOnline
          ? "On"
          : "Off"
        : effectiveOnline
          ? "Online Sync On"
          : "Forced Offline"}
    </Button>
  );
}
