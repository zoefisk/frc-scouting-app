"use client";

import Link from "next/link";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";

type Props = {
  projectId: string;
  projectName: string;
  teamLabel?: string;
};

export default function ProjectAnalysisBreadcrumbs({
  projectId,
  projectName,
  teamLabel,
}: Props) {
  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
      <MuiLink
        component={Link}
        href={`/scouting-projects/${projectId}`}
        underline="hover"
        color="inherit"
      >
        {projectName}
      </MuiLink>
      <MuiLink
        component={Link}
        href={`/scouting-projects/${projectId}/analysis`}
        underline="hover"
        color="inherit"
      >
        Analysis
      </MuiLink>
      {teamLabel ? (
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {teamLabel}
        </Typography>
      ) : null}
    </Breadcrumbs>
  );
}
