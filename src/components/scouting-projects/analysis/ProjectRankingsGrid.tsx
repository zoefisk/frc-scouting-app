"use client";

import React from "react";
import Link from "next/link";
import { Box, Chip, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import type { ProjectRankingRow } from "@/lib/scouting-projects/analysis/buildProjectAnalysisOverview";

type Props = {
  projectId: string;
  rows: ProjectRankingRow[];
};

function TeamLinkCell({
  projectId,
  teamNumber,
}: {
  projectId: string;
  teamNumber: number | null;
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
          backgroundColor: "rgba(15,23,42,0.06)",
          color: "#0f172a",
          border: "1px solid rgba(15,23,42,0.10)",
        }}
      />
    </Link>
  );
}

export default function ProjectRankingsGrid({ projectId, rows }: Props) {
  const columns = React.useMemo<GridColDef<ProjectRankingRow>[]>(
    () => [
      {
        field: "rank",
        headerName: "Rank",
        width: 100,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "teamNumber",
        headerName: "Team",
        minWidth: 74,
        flex: 0.78,
        sortable: false,
        cellClassName: "ranking-divider-right",
        renderCell: (params: GridRenderCellParams<ProjectRankingRow>) => (
          <TeamLinkCell
            projectId={projectId}
            teamNumber={params.row.teamNumber}
          />
        ),
      },
      {
        field: "record",
        headerName: "Record",
        minWidth: 30,
        // flex: 0.95,
      },
      {
        field: "avgMatch",
        headerName: "Avg Match",
        minWidth: 88,
        flex: 0.95,
      },
      {
        field: "avgAutoFuel",
        headerName: "Avg Auto Fuel",
        minWidth: 98,
        flex: 1.05,
      },
      {
        field: "avgTower",
        headerName: "Avg Tower",
        minWidth: 86,
        flex: 0.95,
      },
    ],
    [projectId]
  );

  return (
    <Stack spacing={1.25}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>
          Rankings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current event rankings from TBA, including record and ranking
          averages.
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
        <DataGrid<ProjectRankingRow>
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
              sortModel: [{ field: "rank", sort: "asc" }],
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
              backgroundColor: "rgba(15, 23, 42, 0.04)",
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
            "& .ranking-divider-right": {
              borderRight: (theme) => `2px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Box>
    </Stack>
  );
}
