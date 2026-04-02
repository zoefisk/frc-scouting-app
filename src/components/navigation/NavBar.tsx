"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Box, Button, Stack } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SyncModeToggleButton from "@/components/layout/SyncModeToggleButton";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Alliance Selector", href: "/alliance-selector" },
    { label: "Analysis", href: "/analysis" },
    { label: "Scan QR", href: "/scan" },
  ];

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          PEACCEful Scouting App
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <SyncModeToggleButton />
        </Stack>

        {/* Nav Links */}
        <Stack direction="row" spacing={1}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color={isActive ? "secondary" : "inherit"}
                variant={isActive ? "contained" : "text"}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
