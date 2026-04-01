"use client";

import React from "react";
import { Button } from "@mui/material";
import { useSyncMode } from "@/components/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";

export default function SyncModeToggleButton() {
    const { actualOnline, syncMode, effectiveOnline, toggleSyncMode } = useSyncMode();
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
            sx={{ textTransform: "none" }}
        >
            {effectiveOnline ? "Online Sync On" : "Forced Offline"}
        </Button>
    );
}
