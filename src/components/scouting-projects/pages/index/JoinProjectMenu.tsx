"use client";

import React from "react";
import { Button, Menu, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function JoinProjectMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleJoin = async () => {
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

          <TextField size="small" fullWidth placeholder="Enter code..." />

          <Button
            variant="contained"
            onClick={handleJoin}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Join
          </Button>
        </Stack>
      </Menu>
    </>
  );
}
