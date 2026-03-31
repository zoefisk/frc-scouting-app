import Link from "next/link";
import { Button, Paper, Stack, Typography } from "@mui/material";

export default function DashboardQuickActions() {
    return (
        <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quick Actions
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Button variant="contained">Open Match Scouting</Button>
                    </Link>

                    <Link href="/scan" style={{ textDecoration: "none" }}>
                        <Button variant="outlined">Open QR Scanner</Button>
                    </Link>

                    <Link href="/offline" style={{ textDecoration: "none" }}>
                        <Button variant="outlined">Open Offline Queue</Button>
                    </Link>

                    <Link href="/alliance-selector" style={{ textDecoration: "none" }}>
                        <Button variant="outlined">Open Alliance Picker</Button>
                    </Link>
                </Stack>
            </Stack>
        </Paper>
    );
}
