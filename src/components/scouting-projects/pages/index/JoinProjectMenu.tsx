"use client";

import React from "react";
import {
  Alert,
  Button,
  Divider,
  InputAdornment,
  Menu,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import LinkIcon from "@mui/icons-material/Link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useRouter } from "next/navigation";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";

export default function JoinProjectMenu() {
  const router = useRouter();
  const { effectiveOnline } = useSyncMode();
  const toast = useToast();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inviteLink, setInviteLink] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
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
    const trimmedCode = inviteCode.trim().toUpperCase();
    const trimmedLink = inviteLink.trim();

    if (!trimmedCode && !trimmedLink) {
      toast.warning("Enter a join code or paste an invite link.");
      return;
    }

    try {
      setIsJoining(true);

      const response = await fetch("/api/scouting-projects/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: trimmedCode || undefined,
          inviteLink: trimmedLink || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.inviteLinkToken) {
        throw new Error(data?.error ?? "Could not find that scouting project.");
      }

      handleClose();
      setInviteCode("");
      setInviteLink("");
      router.push(`/join/${data.inviteLinkToken}`);
    } catch (error) {
      console.error("Failed to resolve scouting project invite:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not find that scouting project."
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          px: 2,
          py: 1.1,
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
        <Stack spacing={1.75} sx={{ p: 2, width: { xs: 320, sm: 420 } }}>
          <Stack spacing={0.5}>
            <Typography fontWeight={700}>Join a scouting project</Typography>
            <Typography variant="body2" color="text.secondary">
              Use the short code or paste the full invite link.
            </Typography>
          </Stack>

          {!effectiveOnline ? (
            <Alert severity="warning">
              Joining scouting projects is unavailable while offline.
            </Alert>
          ) : null}

          <TextField
            size="small"
            fullWidth
            label="Join code"
            placeholder="BX62-TGSF"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Divider flexItem>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <TextField
            size="small"
            fullWidth
            label="Invite link"
            placeholder="https://.../join/abc123"
            value={inviteLink}
            onChange={(event) => setInviteLink(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={!effectiveOnline || isJoining}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-end",
            }}
          >
            {isJoining ? "Checking..." : "Continue"}
          </Button>
        </Stack>
      </Menu>
    </>
  );
}
