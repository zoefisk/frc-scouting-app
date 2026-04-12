import React from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import SyncModeToggleButton from "@/components/app/navigation/SyncModeToggleButton";
import { useScoutingProjects } from "@/components/scouting-projects/pages/index/useScoutingProjects";
import type { NavItem } from "./constants";
import { rainbowSidebarBackground } from "./constants";
import NavSection from "./NavSection";

type Props = {
  pathname: string;
  collapsed: boolean;
  primaryItems: NavItem[];
  workspaceItems: NavItem[];
  header: React.ReactNode;
  onNavigate?: () => void;
};

export default function NavbarDrawerContent({
  pathname,
  collapsed,
  primaryItems,
  workspaceItems,
  header,
  onNavigate,
}: Props) {
  const { projects } = useScoutingProjects();
  const pinnedProjects = React.useMemo(
    () => projects.filter((project) => project.pinned).slice(0, 8),
    [projects]
  );
  const [scoutingProjectsExpanded, setScoutingProjectsExpanded] =
    React.useState(false);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: rainbowSidebarBackground,
        color: "white",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0.12) 40%, rgba(15,23,42,0.34) 100%)",
          pointerEvents: "none",
        },
      }}
    >
      {header}

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.12)",
          position: "relative",
          zIndex: 1,
        }}
      />

      <Stack
        spacing={2.5}
        sx={{ flexGrow: 1, px: 1.5, py: 2, position: "relative", zIndex: 1 }}
      >
        <NavSection
          title="Primary"
          items={primaryItems}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
          pinnedProjects={pinnedProjects}
          scoutingProjectsExpanded={scoutingProjectsExpanded}
          onToggleScoutingProjectsExpanded={() =>
            setScoutingProjectsExpanded((prev) => !prev)
          }
        />

        <NavSection
          title="Workspace"
          items={workspaceItems}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </Stack>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.12)",
          position: "relative",
          zIndex: 1,
        }}
      />

      <Stack
        spacing={1.25}
        sx={{ p: collapsed ? 1.25 : 2.25, position: "relative", zIndex: 1 }}
      >
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
}
