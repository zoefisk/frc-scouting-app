import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import JoinProjectMenu from "@/components/scouting-projects/pages/index/JoinProjectMenu";

export default function ProjectsHeader() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scouting Projects
        </Typography>

        <Typography color="text.secondary">
          View every scouting project you own, joined, or saved on this device.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Link href="/scouting-projects/new">
          <Button variant="contained">Create New Project</Button>
        </Link>

        <JoinProjectMenu />
      </Stack>
    </Stack>
  );
}
