"use client";

import React from "react";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 240;
const collapsedWidth = 72;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true); // ✅ default collapsed

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    {
      label: "Scouting Projects",
      href: "/scouting-projects",
      icon: <FolderIcon />,
    },
    { label: "Schedule", href: "/schedule", icon: <EventNoteIcon /> },
    {
      label: "Alliance Selector",
      href: "/alliance-selector",
      icon: <GroupsIcon />,
    },
    { label: "Analysis", href: "/analysis", icon: <AnalyticsIcon /> },
    { label: "Scan QR", href: "/scan", icon: <QrCodeScannerIcon /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f172a", // ✅ dark sidebar
        color: "white",
      }}
    >
      <Toolbar sx={{ justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            PEACCEful
          </Typography>
        )}

        <IconButton
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{ color: "white" }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const active = isActiveRoute(item.href);

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
                "&.Mui-selected": {
                  bgcolor: "#1e293b",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                  color: active ? "#60a5fa" : "rgba(255,255,255,0.7)",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {!collapsed && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              PEACCEful Scouting App
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile top bar */}
      <AppBar position="fixed" sx={{ display: { xs: "flex", md: "none" } }}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">PEACCEful</Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : drawerWidth,
            transition: "width 0.25s",
            overflowX: "hidden",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
