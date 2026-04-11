"use client";

import React from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// TODO, sometime -- invite members by sending email

export default function CopyLinkMenu({ url }: { url: string }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.18s ease",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <AddLinkIcon fontSize="small" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={1} sx={{ p: 1.5, width: 500 }}>
          <TextField
            size="small"
            value={url}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <Tooltip title="Copy link">
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{ alignSelf: "flex-end" }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Menu>
    </>
  );
}
