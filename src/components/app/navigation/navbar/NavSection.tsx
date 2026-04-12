import React from "react";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Link from "next/link";
import type { NavItem } from "./constants";
import type { ProjectListItem } from "@/components/scouting-projects/pages/index/types";

type Props = {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  pinnedProjects?: ProjectListItem[];
  scoutingProjectsExpanded?: boolean;
  onToggleScoutingProjectsExpanded?: () => void;
};

export default function NavSection({
  title,
  items,
  pathname,
  collapsed = false,
  onNavigate,
  pinnedProjects = [],
  scoutingProjectsExpanded = false,
  onToggleScoutingProjectsExpanded,
}: Props) {
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
          const isScoutingProjectsItem = item.href === "/scouting-projects";

          return (
            <Stack key={item.href} spacing={0.5}>
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.href}
                  prefetch={false}
                  onClick={onNavigate}
                  sx={{
                    mb: 0.75,
                    minHeight: 50,
                    borderRadius: 3,
                    px: collapsed ? 1 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    alignItems: "center",
                    backgroundColor: active
                      ? "rgba(255,255,255,0.14)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(255,255,255,0.18)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "0 14px 30px rgba(15,23,42,0.22)"
                      : "none",
                    transition:
                      "background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                    "&:hover": {
                      backgroundColor: active
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.08)",
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
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: active ? 700 : 500,
                          color: active ? "#f8fafc" : "rgba(226,232,240,0.92)",
                        }}
                      />
                      {isScoutingProjectsItem && pinnedProjects.length > 0 ? (
                        <IconButton
                          aria-label={
                            scoutingProjectsExpanded
                              ? "Collapse pinned projects"
                              : "Expand pinned projects"
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onToggleScoutingProjectsExpanded?.();
                          }}
                          size="small"
                          sx={{
                            color: "rgba(226,232,240,0.92)",
                            transform: scoutingProjectsExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.18s ease",
                          }}
                        >
                          <ExpandMoreRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>

              {isScoutingProjectsItem &&
              !collapsed &&
              pinnedProjects.length > 0 ? (
                <Collapse
                  in={scoutingProjectsExpanded}
                  timeout="auto"
                  unmountOnExit
                >
                  <List sx={{ p: 0, pl: 2 }}>
                    {pinnedProjects.map((project) => {
                      const projectActive = isActiveRoute(
                        `/scouting-projects/${project.id}`
                      );

                      return (
                        <ListItemButton
                          key={project.id}
                          component={Link}
                          href={`/scouting-projects/${project.id}`}
                          prefetch={false}
                          onClick={onNavigate}
                          sx={{
                            mb: 0.5,
                            minHeight: 40,
                            borderRadius: 2.5,
                            backgroundColor: projectActive
                              ? "rgba(255,255,255,0.12)"
                              : "transparent",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.08)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={project.name}
                            secondary={project.eventKey}
                            primaryTypographyProps={{
                              fontSize: 14,
                              fontWeight: projectActive ? 700 : 500,
                              color: "rgba(241,245,249,0.94)",
                              noWrap: true,
                            }}
                            secondaryTypographyProps={{
                              fontSize: 12,
                              color: "rgba(191,219,254,0.78)",
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              ) : null}
            </Stack>
          );
        })}
      </List>
    </Stack>
  );
}
