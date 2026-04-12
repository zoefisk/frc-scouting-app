"use client";

import React from "react";
import { Drawer } from "@mui/material";
import { usePathname } from "next/navigation";
import MobileTopBar from "@/components/app/navigation/navbar/MobileTopBar";
import NavbarDrawerContent from "@/components/app/navigation/navbar/NavbarDrawerContent";
import NavbarHeader from "@/components/app/navigation/navbar/NavbarHeader";
import {
  collapsedSidebarWidth,
  desktopSidebarWidth,
  navItems,
} from "@/components/app/navigation/navbar/constants";

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
    const nextWidth = `${collapsedSidebarWidth}px`;

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

  const header = (
    <NavbarHeader
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((prev) => !prev)}
    />
  );

  return (
    <>
      <MobileTopBar onMenuClick={handleDrawerToggle} />

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
        <NavbarDrawerContent
          pathname={pathname}
          collapsed={collapsed}
          primaryItems={primaryItems}
          workspaceItems={workspaceItems}
          header={header}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsedSidebarWidth,
          flexShrink: 0,
          pointerEvents: "none",
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedSidebarWidth : desktopSidebarWidth,
            transition: "width 0.22s ease",
            borderRight: "none",
            boxShadow: "inset -1px 0 0 rgba(148,163,184,0.12)",
            overflowX: "hidden",
            pointerEvents: "auto",
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
      >
        <NavbarDrawerContent
          pathname={pathname}
          collapsed={collapsed}
          primaryItems={primaryItems}
          workspaceItems={workspaceItems}
          header={header}
        />
      </Drawer>
    </>
  );
}
