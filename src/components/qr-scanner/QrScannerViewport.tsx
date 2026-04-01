"use client";

import React from "react";
import { Box, Paper } from "@mui/material";

type Props = {
    regionId: string;
};

export default function QrScannerViewport({ regionId }: Props) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                minHeight: 320,
            }}
        >
            <Box
                id={regionId}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    mx: "auto",
                }}
            />
        </Paper>
    );
}
