import React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import EditNoteIcon from "@mui/icons-material/EditNote";

type WorkflowCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
};

const workflowCards: WorkflowCard[] = [
  {
    title: "Match Scouting",
    description:
      "Open the live match scouting form, configure the setup, and capture match data quickly.",
    href: "/match-scouting",
    icon: <EditNoteIcon />,
    eyebrow: "Collect",
  },
  {
    title: "Scouting Projects",
    description:
      "Create and manage event-specific scouting workspaces, members, and project settings.",
    href: "/scouting-projects",
    icon: <FolderIcon />,
    eyebrow: "Organize",
  },
  {
    title: "Dashboard",
    description:
      "Monitor coverage, queue status, and sync health during active scouting sessions.",
    href: "/dashboard",
    icon: <DashboardIcon />,
    eyebrow: "Monitor",
  },
  {
    title: "Alliance Selector",
    description:
      "Review teams and compare options when preparing for alliance selection decisions.",
    href: "/alliance-selector",
    icon: <GroupsIcon />,
    eyebrow: "Prepare",
  },
  {
    title: "Analysis",
    description:
      "Explore reporting and team-analysis views as the scouting pipeline gets connected.",
    href: "/analysis",
    icon: <AnalyticsIcon />,
    eyebrow: "Review",
  },
  {
    title: "Scan QR",
    description:
      "Import scouting data from QR workflows once scanner-based transfer is ready to use.",
    href: "/scan",
    icon: <QrCodeScannerIcon />,
    eyebrow: "Import",
  },
];

function WorkflowCardItem({
  title,
  description,
  href,
  icon,
  eyebrow,
}: WorkflowCard) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 4,
        borderColor: "rgba(15,23,42,0.12)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
        boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
      }}
    >
      <CardContent sx={{ p: 3.25 }}>
        <Stack spacing={2.5} sx={{ height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Chip
              label={eyebrow}
              size="small"
              sx={{
                alignSelf: "flex-start",
                color: "#1d4ed8",
                backgroundColor: "rgba(59,130,246,0.12)",
                fontWeight: 700,
              }}
            />

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: "#0f172a",
                backgroundColor: "rgba(15,23,42,0.06)",
              }}
            >
              {icon}
            </Box>
          </Stack>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              {title}
            </Typography>

            <Typography color="text.secondary">{description}</Typography>
          </Box>

          <Box sx={{ mt: "auto" }}>
            <Link href={href} style={{ alignSelf: "flex-start" }}>
              <Button variant="text" sx={{ px: 0 }}>
                Open
              </Button>
            </Link>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function HomePageContent() {
  return (
    <Stack spacing={5}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 5,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          background:
            "radial-gradient(circle at top left, rgba(96,165,250,0.22), transparent 34%), linear-gradient(135deg, #eff6ff 0%, #f8fafc 58%, #eef2ff 100%)",
          border: "1px solid rgba(59,130,246,0.14)",
        }}
      >
        <Stack
          spacing={2.5}
          sx={{ maxWidth: 760, position: "relative", zIndex: 1 }}
        >
          <Chip
            label="PEACCEful Scouting"
            sx={{
              alignSelf: "flex-start",
              fontWeight: 700,
              backgroundColor: "rgba(15,23,42,0.08)",
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#0f172a",
            }}
          >
            Run scouting from one clean workspace.
          </Typography>

          <Typography
            sx={{
              maxWidth: 620,
              color: "rgba(15,23,42,0.74)",
              fontSize: { xs: "1rem", md: "1.08rem" },
            }}
          >
            Collect match data, manage scouting projects, monitor sync health,
            and prepare for alliance decisions without bouncing between
            disconnected tools.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Link href="/match-scouting">
              <Button variant="contained" size="large">
                Start Match Scouting
              </Button>
            </Link>

            <Link href="/scouting-projects">
              <Button variant="outlined" size="large">
                Open Projects
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Main Workflows
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Jump into the parts of the app you use during a real event weekend.
        </Typography>

        <Grid container spacing={2.5}>
          {workflowCards.map((card) => (
            <Grid key={card.href} size={{ xs: 12, md: 6, xl: 4 }}>
              <WorkflowCardItem {...card} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}
