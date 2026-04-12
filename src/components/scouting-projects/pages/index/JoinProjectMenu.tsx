"use client";

import React from "react";
import {
  Alert,
  Button,
  Menu,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";

export default function JoinProjectMenu() {
  const { effectiveOnline } = useSyncMode();
  const toast = useToast();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!effectiveOnline) {
      toast.warning("Joining scouting projects is unavailable while offline.");
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleJoin = async () => {
    if (!effectiveOnline) {
      toast.warning("Joining scouting projects is unavailable while offline.");
      return;
    }
    // TODO: handle join logic
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          px: 2,
          py: 1,
        }}
        disabled={!effectiveOnline}
      >
        Join Existing Project
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={1.5} sx={{ p: 2, width: 320 }}>
          <Typography fontWeight={600}>Enter join code</Typography>

          {!effectiveOnline ? (
            <Alert severity="warning">
              Joining scouting projects is unavailable while offline.
            </Alert>
          ) : null}

          <TextField size="small" fullWidth placeholder="Enter code..." />

          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={!effectiveOnline}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Join
          </Button>
        </Stack>
      </Menu>
    </>
  );
}
