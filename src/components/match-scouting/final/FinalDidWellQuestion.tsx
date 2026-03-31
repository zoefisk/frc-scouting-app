"use client";

import React from "react";
import { Box, TextField } from "@mui/material";
import FieldLabelWithHelp from "../FieldLabelWithHelp";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function FinalDidWellQuestion({ value, onChange }: Props) {
    return (
        <Box>
            <FieldLabelWithHelp label="What They Did Well" />
            <TextField
                fullWidth
                multiline
                minRows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="What stood out positively?"
            />
        </Box>
    );
}
