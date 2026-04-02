"use client";

import { useSnackbar } from "notistack";

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (message: string) =>
      enqueueSnackbar(message, { variant: "success" }),
    error: (message: string) => enqueueSnackbar(message, { variant: "error" }),
    warning: (message: string) =>
      enqueueSnackbar(message, { variant: "warning" }),
    info: (message: string) => enqueueSnackbar(message, { variant: "info" }),
  };
}
