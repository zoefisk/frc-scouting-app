"use client";

import React from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";

type Props = {
    onReset: () => void;
};

export default function ScoutingResetButton({ onReset }: Props) {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleConfirm = () => {
        onReset();
        setOpen(false);
    };

    return (
        <>
            <Button variant="outlined" color="warning" onClick={handleOpen}>
                Reset Form
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Reset form?</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        This will clear all entered scouting data. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button color="warning" variant="contained" onClick={handleConfirm}>
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
