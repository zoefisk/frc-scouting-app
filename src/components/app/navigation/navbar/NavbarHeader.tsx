import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function NavbarHeader({ collapsed, onToggleCollapsed }: Props) {
  return (
    <Box
      sx={{
        px: collapsed ? 1.25 : 2.25,
        pt: 2.5,
        pb: 2,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          {collapsed ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(244,114,182,0.28), rgba(59,130,246,0.28))",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#f8fafc" }}>
                P
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: "0.16em",
                  fontWeight: 700,
                }}
              >
                PEACCEful
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, lineHeight: 1.1 }}
              >
                FRC Scouting
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            {!collapsed && (
              <Chip
                label="Beta"
                size="small"
                sx={{
                  color: "#fff7ed",
                  background:
                    "linear-gradient(135deg, rgba(244,114,182,0.22), rgba(251,191,36,0.22), rgba(59,130,246,0.22))",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              />
            )}

            <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton
                onClick={onToggleCollapsed}
                sx={{ color: "rgba(226,232,240,0.92)" }}
              >
                {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {!collapsed && (
          <Typography color="rgba(226,232,240,0.74)" variant="body2">
            Offline-capable scouting workflow for match data, analysis, and team
            coordination.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
