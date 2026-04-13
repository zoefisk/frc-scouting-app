"use client";

import React from "react";
import {
  Button,
  InputAdornment,
  Menu,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";

// TODO, sometime -- invite members by sending email

type Props = {
  url: string;
  inviteCode: string;
};

export default function CopyLinkMenu({ url, inviteCode }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddLinkIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: 999,
          fontWeight: 600,
          textTransform: "none",
          px: 1.5,
          py: 0.75,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        Get Invite Link
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={1.5} sx={{ p: 2, width: { xs: 320, sm: 440 } }}>
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 700 }}>Invite teammates</Typography>
            <Typography variant="body2" color="text.secondary">
              Share the full invite link or just the short join code.
            </Typography>
          </Stack>

          <TextField
            size="small"
            value={url}
            fullWidth
            label="Invite link"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon fontSize="small" />}
                    onClick={() => void handleCopy(url)}
                    sx={{ minWidth: 0, textTransform: "none" }}
                  >
                    Copy
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            size="small"
            value={inviteCode}
            fullWidth
            label="Join code"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <KeyRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon fontSize="small" />}
                    onClick={() => void handleCopy(inviteCode)}
                    sx={{ minWidth: 0, textTransform: "none" }}
                  >
                    Copy
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Menu>
    </>
  );
}
