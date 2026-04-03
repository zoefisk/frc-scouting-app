"use client";

import React from "react";
import { useSnackbar } from "notistack";

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  return React.useMemo(
    () => ({
      success: (message: string) =>
        enqueueSnackbar(message, { variant: "success" }),
      error: (message: string) =>
        enqueueSnackbar(message, { variant: "error" }),
      warning: (message: string) =>
        enqueueSnackbar(message, { variant: "warning" }),
      info: (message: string) => enqueueSnackbar(message, { variant: "info" }),
    }),
    [enqueueSnackbar]
  );
}
