"use client";

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  compact?: boolean;
};

export default function FieldLabelWithHelp({
  label,
  tooltip,
  compact = false,
}: Props) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        mb: compact ? 0 : 1,
      }}
    >
      <Typography
        component="span"
        variant={compact ? undefined : "body1"}
        sx={{
          fontWeight: 500,
          color: "text.primary",
          fontSize: compact ? "inherit" : undefined,
          lineHeight: compact ? "inherit" : undefined,
        }}
      >
        {label}
      </Typography>

      {tooltip ? (
        <Tooltip arrow placement="right" title={tooltip}>
          <IconButton
            size="small"
            sx={{
              ml: 0.5,
              p: compact ? 0 : undefined,
              color: compact ? "inherit" : undefined,
              "& svg": compact ? { fontSize: 16 } : undefined,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}
