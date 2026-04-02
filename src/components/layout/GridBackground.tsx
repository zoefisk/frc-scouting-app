"use client";

import { Box } from "@mui/material";
import React from "react";

type Props = {
  children: React.ReactNode;
  thickness?: number;
  size?: number;
  gridColor?: string;
  backgroundColor?: string;
  fixed?: boolean;
};

export default function GridBackground({
  children,
  thickness = 1,
  size = 24,
  gridColor = "rgba(0,0,0,0.04)",
  backgroundColor = "#fafafa",
  fixed = true,
}: Props) {
  const safeThickness = Math.max(1, Math.min(thickness, size - 1));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor,
        backgroundImage: `
          linear-gradient(${gridColor} ${safeThickness}px, transparent ${safeThickness}px),
          linear-gradient(90deg, ${gridColor} ${safeThickness}px, transparent ${safeThickness}px)
        `,
        backgroundSize: `${size}px ${size}px`,
        ...(fixed && {
          backgroundAttachment: "fixed",
        }),
      }}
    >
      {children}
    </Box>
  );
}
