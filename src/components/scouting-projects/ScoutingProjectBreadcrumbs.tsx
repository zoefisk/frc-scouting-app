"use client";

import Link from "next/link";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function ScoutingProjectBreadcrumbs({ items }: Props) {
  return (
    <Breadcrumbs
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      sx={{ color: "text.secondary" }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (!item.href || isLast) {
          return (
            <Typography
              key={`${item.label}-${index}`}
              color={isLast ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: isLast ? 600 : 500 }}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={`${item.href}-${index}`}
            component={Link}
            href={item.href}
            underline="hover"
            color="inherit"
          >
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
