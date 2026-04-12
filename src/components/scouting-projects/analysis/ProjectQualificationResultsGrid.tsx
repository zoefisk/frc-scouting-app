"use client";

import React from "react";
import Link from "next/link";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import type { ProjectQualificationResultRow } from "@/lib/scouting-projects/analysis/buildProjectAnalysisOverview";

type Props = {
  projectId: string;
  eventKey: string;
  rows: ProjectQualificationResultRow[];
};

function TeamCell({
  projectId,
  teamNumber,
  tone,
}: {
  projectId: string;
  teamNumber: number | null;
  tone: "red" | "blue";
}) {
  if (teamNumber == null) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  return (
    <Link
      href={`/scouting-projects/${projectId}/analysis/teams/frc${teamNumber}`}
      style={{ textDecoration: "none" }}
    >
      <Chip
        label={teamNumber}
        size="small"
        clickable
        sx={{
          fontWeight: 700,
          backgroundColor:
            tone === "red" ? "rgba(239,68,68,0.10)" : "rgba(59,130,246,0.10)",
          color: tone === "red" ? "#b91c1c" : "#1d4ed8",
          border:
            tone === "red"
              ? "1px solid rgba(239,68,68,0.18)"
              : "1px solid rgba(59,130,246,0.18)",
        }}
      />
    </Link>
  );
}

export default function ProjectQualificationResultsGrid({
  projectId,
  eventKey,
  rows,
}: Props) {
  const columns = React.useMemo<GridColDef<ProjectQualificationResultRow>[]>(
    () => [
      {
        field: "videoUrl",
        headerName: "",
        width: 52,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        cellClassName: "qualification-divider-right",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => {
          if (!params.value) {
            return (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            );
          }

          return (
            <Tooltip arrow title="Open YouTube match video">
              <Link
                href={String(params.value)}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", color: "#dc2626" }}
              >
                <LinkRoundedIcon fontSize="small" />
              </Link>
            </Tooltip>
          );
        },
      },
      {
        field: "matchNumber",
        headerName: "Match",
        minWidth: 82,
        flex: 0.72,
        cellClassName: "qualification-divider-right",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <Link
            href={`/scouting-projects/${projectId}/analysis/matches/${params.row.matchNumber}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 700,
            }}
          >
            Q{params.row.matchNumber}
            <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
          </Link>
        ),
      },
      {
        field: "red1",
        headerName: "R1",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-red",
        cellClassName: "qualification-cell-red",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.red1}
            tone="red"
          />
        ),
      },
      {
        field: "red2",
        headerName: "R2",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-red",
        cellClassName: "qualification-cell-red",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.red2}
            tone="red"
          />
        ),
      },
      {
        field: "red3",
        headerName: "R3",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-red",
        cellClassName: "qualification-cell-red qualification-divider-right",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.red3}
            tone="red"
          />
        ),
      },
      {
        field: "blue1",
        headerName: "B1",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-blue",
        cellClassName: "qualification-cell-blue",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.blue1}
            tone="blue"
          />
        ),
      },
      {
        field: "blue2",
        headerName: "B2",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-blue",
        cellClassName: "qualification-cell-blue",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.blue2}
            tone="blue"
          />
        ),
      },
      {
        field: "blue3",
        headerName: "B3",
        minWidth: 72,
        flex: 0.72,
        sortable: false,
        headerClassName: "qualification-header-blue",
        cellClassName: "qualification-cell-blue qualification-divider-right",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => (
          <TeamCell
            projectId={projectId}
            teamNumber={params.row.blue3}
            tone="blue"
          />
        ),
      },
      {
        field: "redScore",
        headerName: "Red",
        width: 72,
        align: "center",
        headerAlign: "center",
        sortable: false,
        headerClassName: "qualification-header-red",
        cellClassName: "qualification-cell-red",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => {
          const redScore = params.row.redScore;
          const blueScore = params.row.blueScore;
          const redWon =
            typeof redScore === "number" &&
            typeof blueScore === "number" &&
            redScore > blueScore;

          return (
            <Typography
              sx={{
                fontWeight: 800,
                color: "#b91c1c",
                textDecoration: redWon ? "underline" : "none",
                textUnderlineOffset: 3,
              }}
            >
              {redScore ?? "-"}
            </Typography>
          );
        },
      },
      {
        field: "blueScore",
        headerName: "Blue",
        width: 72,
        align: "center",
        headerAlign: "center",
        sortable: false,
        headerClassName: "qualification-header-blue",
        cellClassName: "qualification-cell-blue",
        renderCell: (
          params: GridRenderCellParams<ProjectQualificationResultRow>
        ) => {
          const redScore = params.row.redScore;
          const blueScore = params.row.blueScore;
          const blueWon =
            typeof redScore === "number" &&
            typeof blueScore === "number" &&
            blueScore > redScore;

          return (
            <Typography
              sx={{
                fontWeight: 800,
                color: "#1d4ed8",
                textDecoration: blueWon ? "underline" : "none",
                textUnderlineOffset: 3,
              }}
            >
              {blueScore ?? "-"}
            </Typography>
          );
        },
      },
    ],
    [projectId]
  );

  return (
    <Stack spacing={1.25}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>
          Qualification Results
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Event results from TBA for {eventKey}. Video, match, and team cells
          are clickable.
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2.5,
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        }}
      >
        <DataGrid<ProjectQualificationResultRow>
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnResize
          autoHeight
          density="compact"
          rowHeight={34}
          columnHeaderHeight={38}
          initialState={{
            sorting: {
              sortModel: [{ field: "matchNumber", sort: "asc" }],
            },
            pagination: {
              paginationModel: { pageSize: 50, page: 0 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          slots={{
            toolbar: GridToolbar,
          }}
          sx={{
            border: 0,
            "--DataGrid-overlayHeight": "220px",
            "& .MuiDataGrid-toolbarContainer": {
              minHeight: 40,
              px: 1,
              py: 0.25,
              gap: 0.5,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-root": {
              py: 0.25,
              minHeight: 28,
              fontSize: 12,
            },
            "& .MuiDataGrid-columnHeaders": {
              borderRadius: 0,
              minHeight: "38px !important",
            },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
              px: 0.75,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontSize: 12,
              fontWeight: 800,
            },
            "& .MuiDataGrid-cell": {
              fontSize: 12.5,
            },
            "& .MuiChip-root": {
              height: 24,
              fontSize: 12,
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
            "& .qualification-header-red": {
              bgcolor: "error.light",
              color: "error.contrastText",
              fontWeight: 800,
            },
            "& .qualification-header-blue": {
              bgcolor: "info.light",
              color: "info.contrastText",
              fontWeight: 800,
            },
            "& .qualification-cell-red": {
              bgcolor: "rgba(244, 67, 54, 0.04)",
            },
            "& .qualification-cell-blue": {
              bgcolor: "rgba(33, 150, 243, 0.04)",
            },
            "& .qualification-divider-right": {
              borderRight: (theme) => `2px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Box>
    </Stack>
  );
}
