import React from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { mobileTopBarHeight } from "./constants";

type Props = {
  onMenuClick: () => void;
};

export default function MobileTopBar({ onMenuClick }: Props) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        display: { xs: "flex", md: "none" },
        height: mobileTopBarHeight,
        justifyContent: "center",
        background:
          "linear-gradient(90deg, rgba(244,114,182,0.92), rgba(251,191,36,0.88), rgba(74,222,128,0.82), rgba(59,130,246,0.88), rgba(168,85,247,0.92))",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <Toolbar sx={{ minHeight: `${mobileTopBarHeight}px !important` }}>
        <IconButton color="inherit" onClick={onMenuClick} edge="start">
          <MenuIcon />
        </IconButton>

        <Box>
          <Typography
            variant="overline"
            sx={{ display: "block", lineHeight: 1 }}
          >
            PEACCEful
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            FRC Scouting
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
