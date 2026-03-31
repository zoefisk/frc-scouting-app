"use client";

import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";

type Props = {
    moved: boolean;
    didNothing: boolean;
    onMovedChange: (val: boolean) => void;
    onDidNothingChange: (val: boolean) => void;
};

export default function MovementQuestion({
                                             moved,
                                             didNothing,
                                             onMovedChange,
                                             onDidNothingChange,
                                         }: Props) {
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle1">Robot Activity</Typography>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={moved}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            onMovedChange(checked);
                            if (checked) onDidNothingChange(false);
                        }}
                    />
                }
                label="Robot moved during auto"
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={didNothing}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            onDidNothingChange(checked);
                            if (checked) onMovedChange(false);
                        }}
                    />
                }
                label="Did nothing"
            />
        </Stack>
    );
}
