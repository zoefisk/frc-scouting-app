"use client";

import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
    label: string;
    tooltip?: React.ReactNode;
};

export default function FieldLabelWithHelp({ label, tooltip }: Props) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                {label}
            </Typography>

            {tooltip && (
                <Tooltip arrow placement="right" title={tooltip}>
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}
