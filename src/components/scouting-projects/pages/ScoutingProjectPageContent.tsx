"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import ConstructionIcon from "@mui/icons-material/Construction";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SettingsIcon from "@mui/icons-material/Settings";

import ScoutingSchedule from "@/components/scouting-projects/dashboard/ScoutingSchedule";
import type { ScoutingProjectDoc } from "@/lib/scouting-projects/types";
import { getProjectMemberRole } from "@/lib/scouting-projects/types";
import type { ProjectEventOverview } from "@/lib/scouting-projects/eventOverview";
import CopyLinkMenu from "@/components/scouting-projects/dashboard/scouting-schedule/CopyLinkMenu";
import NoAccess from "@/components/auth/NoAccess";
import { useAuth } from "@/components/app/providers/AuthProvider";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  eventOverview: ProjectEventOverview | null;
};

type QuickAction = {
  title: string;
  description: string;
  icon: React.ElementType;
  hrefSuffix: string;
};

function getStatusChipStyles(tone: ProjectEventOverview["statusTone"]) {
  if (tone === "success") {
    return {
      backgroundColor: "rgba(34,197,94,0.12)",
      color: "#166534",
      border: "1px solid rgba(34,197,94,0.18)",
    };
  }

  if (tone === "active") {
    return {
      backgroundColor: "rgba(59,130,246,0.12)",
      color: "#1d4ed8",
      border: "1px solid rgba(59,130,246,0.18)",
    };
  }

  return {
    backgroundColor: "rgba(15,23,42,0.06)",
    color: "#334155",
    border: "1px solid rgba(15,23,42,0.12)",
  };
}

const quickActions: QuickAction[] = [
  {
    title: "Match Scouting",
    description: "Scout qualification and playoff matches.",
    icon: SportsScoreIcon,
    hrefSuffix: "match-scouting",
  },
  {
    title: "Pit Scouting",
    description: "View and record robot and team pit data.",
    icon: ConstructionIcon,
    hrefSuffix: "pit-scouting",
  },
  {
    title: "Alliance Selection",
    description: "Build shortlists and compare captain options.",
    icon: EmojiEventsIcon,
    hrefSuffix: "alliance-selection",
  },
  {
    title: "Analysis",
    description: "Review trends, rankings, and scouting insights.",
    icon: AnalyticsIcon,
    hrefSuffix: "analysis",
  },
  {
    title: "Offline Caching",
    description: "Prepare data and forms for offline use.",
    icon: CloudOffIcon,
    hrefSuffix: "offline-caching",
  },
  {
    title: "Scan QR / Import CSV",
    description: "Bring in scouting data from external sources.",
    icon: QrCodeScannerIcon,
    hrefSuffix: "import",
  },
];

function QuickActionCard({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        width: "100%",
        height: "100%",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          minHeight: 92,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.25,
          transition: "all 0.18s ease",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-2px)",
            boxShadow: 3,
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            p: 1.25,
            display: "flex",
          }}
        >
          <Stack spacing={1} sx={{ width: "100%", minWidth: 0 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                lineHeight: 1.15,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {title}
            </Typography>
          </Stack>
        </Box>
      </Card>
    </Link>
  );
}

export default function ScoutingProjectPageContent({
  project,
  eventOverview,
}: Props) {
  const { user, loading } = useAuth();
  const memberRole = getProjectMemberRole(project, user?.uid);
  const requiresAuth = project.accessMode === "authenticated";
  const canAccessProject = !requiresAuth || Boolean(memberRole);
  const canManageProject = memberRole === "owner" || memberRole === "admin";
  const canInviteMembers =
    canManageProject || (memberRole === "member" && project.allowMemberInvites);

  const renderedQuickActions = quickActions
    .filter((action) => {
      if (project.dataMode === "match" && action.title === "Pit Scouting") {
        return false;
      }

      if (project.dataMode === "pit" && action.title === "Match Scouting") {
        return false;
      }

      return true;
    })
    .map((action) => {
      const isSingleDataModeWideCard =
        (project.dataMode === "match" && action.title === "Match Scouting") ||
        (project.dataMode === "pit" && action.title === "Pit Scouting");

      return {
        ...action,
        gridSize: isSingleDataModeWideCard
          ? { xs: 12, lg: 12 }
          : { xs: 6, lg: 6 },
      };
    });

  if (requiresAuth && loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (requiresAuth && !user) {
    return (
      <NoAccess
        title="Sign in to view this project."
        description="This scouting project is limited to approved members."
        ctaHref="/login"
        ctaLabel="Go to Login"
      />
    );
  }

  if (!canAccessProject) {
    return (
      <NoAccess note="If you should have access, ask an owner or admin to add your account to this project." />
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.10) 0%, rgba(99,102,241,0.08) 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "flex-start" }}
          >
            <Stack spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {project.name}
                </Typography>

                {eventOverview && (
                  <Chip
                    label={eventOverview.statusLabel}
                    sx={{
                      height: 34,
                      px: 1,
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      ...getStatusChipStyles(eventOverview.statusTone),
                    }}
                  />
                )}
              </Stack>

              <Typography variant="body1" color="text.secondary">
                Central workspace for scouting operations, event planning, and
                team analysis.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <Chip
                  label={`EVENT • ${project.eventKey} (${project.year})`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "background.paper",
                  }}
                />

                <Chip
                  label={`TEAMS • ${project.teamKeys.length}`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "background.paper",
                  }}
                />

                <Chip
                  label={`ACCESS • ${project.accessMode}`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "background.paper",
                  }}
                />

                <Chip
                  label={`DATA • ${project.dataMode}`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "background.paper",
                  }}
                />
              </Stack>

              {eventOverview?.eventDateLabel && (
                <Typography variant="body2" color="text.secondary">
                  Event dates: {eventOverview.eventDateLabel}
                </Typography>
              )}

              {(canInviteMembers || canManageProject) && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ pt: 0.5 }}
                >
                  {canInviteMembers ? (
                    <CopyLinkMenu
                      url={`https://frc-scouting-app-jade.vercel.app/join/${project.inviteLinkToken}`} // TODO, add the url as an environment variable
                    />
                  ) : null}

                  {canManageProject ? (
                    <Link
                      href={`/scouting-projects/${project.id}/settings`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SettingsIcon fontSize="small" />}
                        sx={{ borderRadius: 999 }}
                      >
                        Settings
                      </Button>
                    </Link>
                  ) : null}
                </Stack>
              )}
            </Stack>

            <Box
              sx={{
                width: { xs: "100%", lg: 280 },
                flexShrink: 0,
              }}
            >
              <Grid container spacing={1.25} alignItems="stretch">
                {renderedQuickActions.map((action) => (
                  <Grid
                    key={action.title}
                    size={action.gridSize}
                    sx={{ display: "flex" }}
                  >
                    <QuickActionCard
                      title={action.title}
                      icon={action.icon}
                      href={`/scouting-projects/${project.id}/${action.hrefSuffix}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>

          <Box
            sx={{
              display: { xs: "none", lg: "block" },
              height: 1,
              backgroundColor: "rgba(15,23,42,0.08)",
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: "auto" }}
            >
              Open a workspace tool from the compact launcher on the right.
            </Typography>

            {canInviteMembers ? (
              <Typography variant="body2" color="text.secondary">
                Invite controls are available from the link button above.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      <ScoutingSchedule project={project} />
    </Stack>
  );
}
