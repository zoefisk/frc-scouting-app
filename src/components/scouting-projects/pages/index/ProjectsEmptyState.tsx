import { Box, Stack, Typography } from "@mui/material";

export default function ProjectsEmptyState() {
  return (
    <Box
      sx={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 4,
        p: 3,
        backgroundColor: "white",
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          No scouting projects yet
        </Typography>

        <Typography color="text.secondary">
          Create a new scouting project or join one from an invite link to see
          it here.
        </Typography>
      </Stack>
    </Box>
  );
}
