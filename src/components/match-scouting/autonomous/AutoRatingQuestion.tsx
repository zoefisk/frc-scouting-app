"use client";

import { Slider, Stack, Typography } from "@mui/material";

type Props = {
    value: number;
    onChange: (value: number) => void;
};

export default function AutoRatingQuestion({ value, onChange }: Props) {
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle1">Autonomous Rating</Typography>

            <Slider
                value={value}
                min={1}
                max={5}
                step={1}
                marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                ]}
                onChange={(_, val) => onChange(val as number)}
                valueLabelDisplay="auto"
            />
        </Stack>
    );
}
