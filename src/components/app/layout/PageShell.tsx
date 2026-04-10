import * as React from "react";
import { Box } from "@mui/material";

type PageWidth = "xs" | "sm" | "md" | "lg" | "xl";

const mobileTopBarHeight = 64;

type Props = {
  children: React.ReactNode;
  width?: PageWidth;
};

const WIDTH_MAP: Record<PageWidth, string> = {
  xs: "420px",
  sm: "640px",
  md: "900px",
  lg: "1200px",
  xl: "1500px",
};

export default function PageShell({ children, width = "md" }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: {
          xs: `calc(${mobileTopBarHeight}px + 24px)`,
          sm: `calc(${mobileTopBarHeight}px + 32px)`,
          md: 10,
        },
        pb: { xs: 6, sm: 8, md: 10 },
        ml: {
          xs: 0,
          md: "var(--app-sidebar-width, 296px)",
        },
        px: { xs: 2, sm: 3, md: 4 },
        transition: "margin-left 0.25s ease",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: WIDTH_MAP[width],
          maxWidth: {
            xs: "calc(100vw - 32px)",
            sm: "calc(100vw - 48px)",
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
