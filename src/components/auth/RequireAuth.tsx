"use client";

import React from "react";
import { CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RequireAuth({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <Stack alignItems="center" sx={{ py: 8 }}>
                <CircularProgress />
            </Stack>
        );
    }

    return <>{children}</>;
}
