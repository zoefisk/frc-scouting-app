import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudOffIcon from "@mui/icons-material/CloudOff";

export const mobileTopBarHeight = 64;
export const desktopSidebarWidth = 296;
export const collapsedSidebarWidth = 88;

export const rainbowSidebarBackground = `
  radial-gradient(circle at 8% 12%, rgba(255, 99, 132, 0.34), transparent 20%),
  radial-gradient(circle at 92% 10%, rgba(251, 191, 36, 0.26), transparent 18%),
  radial-gradient(circle at 78% 30%, rgba(74, 222, 128, 0.22), transparent 18%),
  radial-gradient(circle at 14% 60%, rgba(56, 189, 248, 0.24), transparent 22%),
  radial-gradient(circle at 88% 72%, rgba(168, 85, 247, 0.26), transparent 22%),
  radial-gradient(circle at 34% 88%, rgba(244, 114, 182, 0.24), transparent 20%),
  linear-gradient(180deg, #0f172a 0%, #111827 46%, #172554 100%)
`;

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  section: "primary" | "workspace";
};

export const navItems: NavItem[] = [
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
