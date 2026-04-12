"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

type FeatureCard = {
  title: string;
  href: string;
  eyebrow: string;
  description: string;
};

const primaryCards: FeatureCard[] = [
  {
    title: "Match Scouting",
    href: "/match-scouting",
    eyebrow: "Live Entry",
    description:
      "Open the match scouting form and record data during play without leaving the main workflow.",
  },
  {
    title: "Scouting Projects",
    href: "/scouting-projects",
    eyebrow: "Setup",
    description:
      "Create and manage event workspaces, collaboration structure, and scouting configuration.",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    eyebrow: "Operations",
    description:
      "Check sync status, scouting coverage, and event workflow health throughout the weekend.",
  },
];

const supportCards: FeatureCard[] = [
  {
    title: "Alliance Selector",
    href: "/alliance-selector",
    eyebrow: "Strategy",
    description: "Compare teams and review options for alliance conversations.",
  },
  {
    title: "Analysis",
    href: "/analysis",
    eyebrow: "Review",
    description:
      "Open reporting and team analysis views as those tools come online.",
  },
  {
    title: "Scan QR",
    href: "/scan",
    eyebrow: "Transfer",
    description: "Bring in scouting data from QR-based transfer workflows.",
  },
  {
    title: "Offline Tools",
    href: "/offline",
    eyebrow: "Offline",
    description: "Manage downloaded events and offline-first operation modes.",
  },
];

const workflowSteps = [
  "Set up the event and project structure first.",
  "Use match scouting as the live collection workflow.",
  "Check the dashboard when coverage or sync issues come up.",
  "Move into analysis and alliance tools when strategy starts.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        color: "#64748b",
        fontWeight: 800,
        letterSpacing: "0.14em",
      }}
    >
      {children}
    </Typography>
  );
}

function HomeCard({ card }: { card: FeatureCard }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        border: "1px solid rgba(15,23,42,0.09)",
        borderRadius: 5,
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.92) 100%)",
        boxShadow: "0 16px 38px rgba(15,23,42,0.05)",
        p: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(244,114,182,0.04), rgba(251,191,36,0.03), rgba(59,130,246,0.05))",
          pointerEvents: "none",
        },
      }}
    >
      <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
        <SectionLabel>{card.eyebrow}</SectionLabel>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          {card.title}
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            maxWidth: 420,
          }}
        >
          {card.description}
        </Typography>

        <Box>
          <Link href={card.href} prefetch={false}>
            <Button
              variant="text"
              sx={{
                px: 0,
                color: "#1d4ed8",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#1e40af",
                },
              }}
            >
              Open
            </Button>
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

function HeroPanel() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(15,23,42,0.09)",
        borderRadius: 6,
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 5 },
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.94) 100%)",
        boxShadow: "0 18px 44px rgba(15,23,42,0.06)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 18%, rgba(244,114,182,0.12), transparent 22%), radial-gradient(circle at 88% 16%, rgba(251,191,36,0.1), transparent 18%), radial-gradient(circle at 76% 72%, rgba(59,130,246,0.12), transparent 24%)",
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 760,
        }}
      >
        <SectionLabel>PEACCEful Scouting</SectionLabel>

        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "2.5rem", md: "3.8rem" },
            lineHeight: 0.96,
            letterSpacing: "-0.06em",
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Run an event from one calm, reliable scouting workspace.
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "1rem", md: "1.08rem" },
            maxWidth: 680,
            color: "rgba(15,23,42,0.72)",
          }}
        >
          Use this app to handle live match scouting, event setup, operational
          awareness, and strategy workflows without bouncing between
          disconnected tools.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Link href="/match-scouting" prefetch={false}>
            <Button variant="contained" size="large">
              Start Match Scouting
            </Button>
          </Link>

          <Link href="/scouting-projects" prefetch={false}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "#0f172a",
                borderColor: "rgba(15,23,42,0.14)",
              }}
            >
              Open Scouting Projects
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}

function WorkflowCard() {
  return (
    <Box
      sx={{
        border: "1px solid rgba(15,23,42,0.09)",
        borderRadius: 5,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.94) 100%)",
        boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
        p: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(59,130,246,0.02), rgba(168,85,247,0.03))",
          pointerEvents: "none",
        },
      }}
    >
      <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
        <SectionLabel>Recommended Flow</SectionLabel>

        {workflowSteps.map((step, index) => (
          <Stack
            key={step}
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                backgroundColor: "rgba(37,99,235,0.1)",
                color: "#1d4ed8",
                fontWeight: 900,
                fontSize: "0.82rem",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>

            <Typography color="text.secondary">{step}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default function HomePageContent() {
  return (
    <Stack spacing={5}>
      <HeroPanel />

      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 2.5,
            textDecoration: "underline",
            textDecorationColor: "rgba(59,130,246,0.18)",
            textUnderlineOffset: "0.14em",
          }}
        >
          Primary Workflows
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          {primaryCards.map((card) => (
            <HomeCard key={card.href} card={card} />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 2.5,
            textDecoration: "underline",
            textDecorationColor: "rgba(244,114,182,0.14)",
            textUnderlineOffset: "0.14em",
          }}
        >
          Supporting Tools
        </Typography>

        <Box
          sx={{
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          {supportCards.map((card) => (
            <HomeCard key={card.href} card={card} />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 1, maxWidth: 420 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 2.5,
            textDecoration: "underline",
            textDecorationColor: "rgba(99,102,241,0.14)",
            textUnderlineOffset: "0.14em",
          }}
        >
          Event Flow
        </Typography>

        <WorkflowCard />
      </Box>
    </Stack>
  );
}
