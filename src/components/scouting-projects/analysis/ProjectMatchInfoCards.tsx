"use client";

import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type InfoItem = {
  label: string;
  value: string;
};

type Props = {
  title: string;
  subtitle: string;
  generalInfo: InfoItem[];
  eventInfo: InfoItem[];
  youtubeUrl: string | null;
};

function CompactInfoGrid({
  title,
  items,
}: {
  title: string;
  items: InfoItem[];
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
      <Stack spacing={1}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, letterSpacing: -0.1 }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.75,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                px: 1,
                py: 0.625,
                backgroundColor: "rgba(15, 23, 42, 0.02)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  fontSize: "0.6rem",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.3 }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ProjectMatchInfoCards({
  title,
  subtitle,
  generalInfo,
  eventInfo,
  youtubeUrl,
}: Props) {
  return (
    <Stack spacing={1.25}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, letterSpacing: -0.4 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        {youtubeUrl && (
          <Chip
            component={Link}
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            label="Watch on YouTube"
            icon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
            size="small"
            variant="outlined"
            color="error"
            clickable
            sx={{ flexShrink: 0 }}
          />
        )}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        <CompactInfoGrid title="General Info" items={generalInfo} />
        <CompactInfoGrid title="Scores" items={eventInfo} />
      </Box>
    </Stack>
  );
}
