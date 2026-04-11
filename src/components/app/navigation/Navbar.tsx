"use client";

import React from "react";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SyncModeToggleButton from "@/components/app/navigation/SyncModeToggleButton";

const mobileTopBarHeight = 64;
const desktopSidebarWidth = 296;
const collapsedSidebarWidth = 88;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  section: "primary" | "workspace";
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <HomeIcon />, section: "primary" },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
    section: "primary",
  },
  {
    label: "Scouting Projects",
    href: "/scouting-projects",
    icon: <FolderIcon />,
    section: "primary",
  },
  {
    label: "Match Scouting",
    href: "/match-scouting",
    icon: <EditNoteIcon />,
    section: "primary",
  },
  {
    label: "Alliance Selector",
    href: "/alliance-selector",
    icon: <GroupsIcon />,
    section: "workspace",
  },
  {
    label: "Analysis",
    href: "/analysis",
    icon: <AnalyticsIcon />,
    section: "workspace",
  },
  {
    label: "Scan QR",
    href: "/scan",
    icon: <QrCodeScannerIcon />,
    section: "workspace",
  },
  {
    label: "Offline",
    href: "/offline",
    icon: <CloudOffIcon />,
    section: "workspace",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon />,
    section: "workspace",
  },
];

function NavSection({
  title,
  items,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Stack spacing={1.25}>
      {!collapsed && (
        <Typography
          variant="overline"
          sx={{
            px: 1.5,
            color: "rgba(226,232,240,0.72)",
            letterSpacing: "0.18em",
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
      )}

      <List sx={{ p: 0 }}>
        {items.map((item) => {
          const active = isActiveRoute(item.href);

          return (
            <Tooltip
              key={item.href}
              title={collapsed ? item.label : ""}
              placement="right"
            >
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onNavigate}
                sx={{
                  mb: 0.75,
                  minHeight: 50,
                  borderRadius: 3,
                  px: collapsed ? 1 : 1.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  alignItems: "center",
                  backgroundColor: active
                    ? "rgba(148,163,184,0.16)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(148,163,184,0.24)"
                    : "1px solid transparent",
                  transition:
                    "background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                  "&:hover": {
                    backgroundColor: active
                      ? "rgba(148,163,184,0.2)"
                      : "rgba(30,41,59,0.92)",
                    transform: collapsed ? "none" : "translateX(2px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    mr: collapsed ? 0 : 1,
                    justifyContent: "center",
                    color: active ? "#f8fafc" : "rgba(203,213,225,0.82)",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      color: active ? "#f8fafc" : "rgba(226,232,240,0.92)",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Stack>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);

  React.useEffect(() => {
    const savedValue = window.localStorage.getItem("app-sidebar-collapsed");
    if (savedValue != null) {
      setCollapsed(savedValue === "true");
    }
  }, []);

  React.useEffect(() => {
    const nextWidth = collapsed
      ? `${collapsedSidebarWidth}px`
      : `${desktopSidebarWidth}px`;

    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      nextWidth
    );
    window.localStorage.setItem("app-sidebar-collapsed", String(collapsed));

    return () => {
      document.documentElement.style.removeProperty("--app-sidebar-width");
    };
  }, [collapsed]);

  const primaryItems = navItems.filter((item) => item.section === "primary");
  const workspaceItems = navItems.filter(
    (item) => item.section === "workspace"
  );

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #0f172a 0%, #111827 48%, #172554 100%)",
        color: "white",
      }}
    >
      <Box sx={{ px: collapsed ? 1.25 : 2.25, pt: 2.5, pb: 2 }}>
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
                  backgroundColor: "rgba(96,165,250,0.16)",
                  border: "1px solid rgba(147,197,253,0.22)",
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#dbeafe" }}>
                  P
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    color: "rgba(191,219,254,0.78)",
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
                    color: "#dbeafe",
                    backgroundColor: "rgba(96,165,250,0.16)",
                    border: "1px solid rgba(147,197,253,0.22)",
                  }}
                />
              )}

              <Tooltip
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <IconButton
                  onClick={() => setCollapsed((prev) => !prev)}
                  sx={{ color: "rgba(226,232,240,0.92)" }}
                >
                  {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {!collapsed && (
            <Typography color="rgba(226,232,240,0.74)" variant="body2">
              Offline-capable scouting workflow for match data, analysis, and
              team coordination.
            </Typography>
          )}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(148,163,184,0.14)" }} />

      <Stack spacing={2.5} sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        <NavSection
          title="Primary"
          items={primaryItems}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => setMobileOpen(false)}
        />

        <NavSection
          title="Workspace"
          items={workspaceItems}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </Stack>

      <Divider sx={{ borderColor: "rgba(148,163,184,0.14)" }} />

      <Stack spacing={1.25} sx={{ p: collapsed ? 1.25 : 2.25 }}>
        {!collapsed && (
          <Typography
            variant="body2"
            sx={{ color: "rgba(226,232,240,0.76)", fontWeight: 600 }}
          >
            Sync Mode
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <SyncModeToggleButton compact={collapsed} />
        </Box>
      </Stack>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "flex", md: "none" },
          height: mobileTopBarHeight,
          justifyContent: "center",
          backgroundColor: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(148,163,184,0.18)",
        }}
      >
        <Toolbar sx={{ minHeight: `${mobileTopBarHeight}px !important` }}>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start">
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

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: desktopSidebarWidth,
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? collapsedSidebarWidth : desktopSidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedSidebarWidth : desktopSidebarWidth,
            transition: "width 0.22s ease",
            borderRight: "none",
            boxShadow: "inset -1px 0 0 rgba(148,163,184,0.12)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
