import React from "react";
import Link from "next/link";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
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
import type { ProjectEventOverview } from "@/lib/scouting-projects/eventOverview";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  eventOverview: ProjectEventOverview | null;
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

const quickActions = [
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
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
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
          height: 132,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
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
            p: 1.5,
            display: "flex",
          }}
        >
          <Stack spacing={1} sx={{ width: "100%", minWidth: 0 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.75,
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
                lineHeight: 1.2,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                lineHeight: 1.25,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
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
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-start" }}
          >
            <Stack spacing={1.5} sx={{ minWidth: 0 }}>
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
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {/* TODO: only show this button for admins */}
              <Link
                href={`/scouting-projects/${project.id}/settings`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </Box>
              </Link>
            </Stack>
          </Stack>

          <Grid container spacing={1.5} alignItems="stretch">
            {quickActions.map((action) => (
              <Grid
                key={action.title}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{ display: "flex" }}
              >
                <QuickActionCard
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={`/scouting-projects/${project.id}/${action.hrefSuffix}`}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>

      <ScoutingSchedule project={project} />
    </Stack>
  );
}
