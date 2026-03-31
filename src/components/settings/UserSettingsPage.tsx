"use client";

import React from "react";
import Link from "next/link";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useAuth } from "@/components/providers/AuthProvider";
import { useSyncMode } from "@/components/providers/SyncModeProvider";
import {
    getUserProfile,
    type AppUserProfile,
} from "@/lib/firebase/users/getUserProfile";
import { useToast } from "@/lib/hooks/useToast";

function SettingRow({
                        label,
                        value,
                        action,
                    }: {
    label: string;
    value: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
        >
            <Stack spacing={0.25}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Box>{value}</Box>
            </Stack>

            {action}
        </Stack>
    );
}

export default function UserSettingsPage() {
    const { user, signOut } = useAuth();
    const { actualOnline, effectiveOnline, syncMode, toggleSyncMode } = useSyncMode();
    const toast = useToast();

    const [profile, setProfile] = React.useState<AppUserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = React.useState(true);
    const [profileError, setProfileError] = React.useState("");

    const loadProfile = React.useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoadingProfile(false);
            return;
        }

        setLoadingProfile(true);
        setProfileError("");

        try {
            const nextProfile = await getUserProfile(user.uid);
            setProfile(nextProfile);
        } catch (error) {
            console.error(error);
            setProfileError("Could not load user profile.");
        } finally {
            setLoadingProfile(false);
        }
    }, [user]);

    React.useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleToggleSyncMode = async () => {
        const goingOffline = syncMode === "online";

        try {
            await toggleSyncMode();

            if (goingOffline) {
                toast.info("Cloud sync turned off. Saving locally only.");
            } else {
                toast.success("Cloud sync enabled.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not update sync preference.");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("Signed out.");
        } catch (error) {
            console.error(error);
            toast.error("Could not sign out.");
        }
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    User Settings
                </Typography>
                <Typography color="text.secondary">
                    Manage your account, access level, and scouting app preferences.
                </Typography>
            </Box>

            {profileError && <Alert severity="warning">{profileError}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Account
                    </Typography>

                    <SettingRow
                        label="Display Name"
                        value={user?.displayName || "No display name"}
                    />

                    <Divider />

                    <SettingRow
                        label="Email"
                        value={user?.email || "No email available"}
                    />

                    <Divider />

                    <SettingRow
                        label="User ID"
                        value={
                            <Typography
                                sx={{
                                    fontFamily: "monospace",
                                    wordBreak: "break-all",
                                }}
                            >
                                {user?.uid || "-"}
                            </Typography>
                        }
                    />

                    <Divider />

                    <SettingRow
                        label="Profile Status"
                        value={
                            loadingProfile ? (
                                <Typography color="text.secondary">
                                    Loading profile…
                                </Typography>
                            ) : profile ? (
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Chip
                                        label={profile.active ? "Active" : "Inactive"}
                                        color={profile.active ? "success" : "default"}
                                        size="small"
                                    />
                                    <Chip
                                        label={profile.role}
                                        color={profile.role === "admin" ? "primary" : "default"}
                                        size="small"
                                    />
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">
                                    No profile found.
                                </Typography>
                            )
                        }
                        action={
                            <Button variant="outlined" size="small" onClick={loadProfile}>
                                Refresh
                            </Button>
                        }
                    />
                </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Sync Preferences
                    </Typography>

                    <SettingRow
                        label="Connection"
                        value={
                            <Chip
                                label={actualOnline ? "Device Online" : "Device Offline"}
                                color={actualOnline ? "success" : "default"}
                                size="small"
                            />
                        }
                    />

                    <Divider />

                    <SettingRow
                        label="Sync Mode"
                        value={
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip
                                    label={effectiveOnline ? "Online Sync On" : "Forced Offline"}
                                    color={effectiveOnline ? "success" : "warning"}
                                    size="small"
                                />
                                <Chip
                                    label={syncMode === "online" ? "Automatic" : "Manual Offline"}
                                    variant="outlined"
                                    size="small"
                                />
                            </Stack>
                        }
                        action={
                            <Button variant="outlined" onClick={handleToggleSyncMode}>
                                {effectiveOnline ? "Turn Sync Off" : "Turn Sync On"}
                            </Button>
                        }
                    />
                </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tools
                    </Typography>

                    <SettingRow
                        label="Scouting Dashboard"
                        value={
                            <Typography color="text.secondary">
                                View match coverage, pending sync, and scouting workflow status.
                            </Typography>
                        }
                        action={
                            <Link href="/dashboard" style={{ textDecoration: "none" }}>
                                <Button variant="outlined">Open Dashboard</Button>
                            </Link>
                        }
                    />

                    <Divider />

                    <SettingRow
                        label="QR Scanner"
                        value={
                            <Typography color="text.secondary">
                                Scan scouting QR codes and review imported entries.
                            </Typography>
                        }
                        action={
                            <Link href="/scan" style={{ textDecoration: "none" }}>
                                <Button variant="outlined">Open Scanner</Button>
                            </Link>
                        }
                    />

                    <Divider />

                    <SettingRow
                        label="Offline Queue"
                        value={
                            <Typography color="text.secondary">
                                Review locally stored entries and sync behavior.
                            </Typography>
                        }
                        action={
                            <Link href="/offline" style={{ textDecoration: "none" }}>
                                <Button variant="outlined">Open Offline Page</Button>
                            </Link>
                        }
                    />
                </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Session
                    </Typography>

                    <Typography color="text.secondary">
                        Sign out of this device when you are done scouting.
                    </Typography>

                    <Box>
                        <Button color="error" variant="outlined" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Stack>
    );
}
