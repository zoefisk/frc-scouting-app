import { Box, Paper, Stack, Typography } from "@mui/material";

type InfoItem = {
  label: string;
  value: string;
};

type Props = {
  teamDisplayName: string;
  teamLongName: string;
  eventName: string;
  generalInfo: InfoItem[];
  eventInfo: InfoItem[];
};

function InfoGrid({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: InfoItem[];
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 2.5,
        height: "100%",
      }}
    >
      <Stack spacing={1.5}>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: -0.2 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.25,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                px: 1.25,
                py: 1,
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
                }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ProjectTeamInfoCards({
  teamDisplayName,
  teamLongName,
  eventName,
  generalInfo,
  eventInfo,
}: Props) {
  return (
    <Stack spacing={1.75}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.4 }}>
          Team {teamDisplayName}
        </Typography>
        <Typography color="text.secondary">
          {teamLongName} at {eventName}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "minmax(0, 1fr) minmax(0, 1.2fr)",
          },
          gap: 1.5,
        }}
      >
        <InfoGrid
          title="General Info"
          description="Core team and project context for this analysis view."
          items={generalInfo}
        />
        <InfoGrid
          title="Event Snapshot"
          description="How this team is tracking at the current event."
          items={eventInfo}
        />
      </Box>
    </Stack>
  );
}
