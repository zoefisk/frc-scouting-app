"use client";

import React from "react";
import { SnackbarProvider } from "notistack";

type Props = {
    children: React.ReactNode;
};

export default function ToastProvider({ children }: Props) {
    return (
        <SnackbarProvider
            maxSnack={4}
            autoHideDuration={3000}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            preventDuplicate
        >
            {children}
        </SnackbarProvider>
    );
}
