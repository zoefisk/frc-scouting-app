"use client";

import * as React from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import type {
  ProjectTeamRawTable,
  ProjectTeamRawTableRow,
} from "@/lib/scouting-projects/analysis/buildProjectTeamAnalysisOverview";

type Props = {
  table: ProjectTeamRawTable;
  defaultExpanded?: boolean;
};

export default function ProjectTeamRawDataAccordion({
  table,
  defaultExpanded = false,
}: Props) {
  const columns = React.useMemo<GridColDef<ProjectTeamRawTableRow>[]>(
    () =>
      table.columns.map((column) => ({
        field: column.field,
        headerName: column.headerName,
        minWidth:
          column.field === "savedAt"
            ? 140
            : column.field === "matchNumber"
              ? 76
              : column.field === "scoutingPosition"
                ? 74
                : 120,
        flex:
          column.field === "savedAt"
            ? 1
            : column.field === "matchNumber"
              ? 0.55
              : 0.9,
        sortable: false,
        valueFormatter: (value) => {
          if (value == null || value === "") {
            return "-";
          }

          return String(value);
        },
      })),
    [table.columns]
  );

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: "14px !important",
        overflow: "hidden",
        boxShadow: "none",
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          px: 2,
          py: 0.5,
          backgroundColor: "rgba(15, 23, 42, 0.02)",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={0.25}>
          <Typography sx={{ fontWeight: 700 }}>{table.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {table.description}
          </Typography>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {table.rows.length === 0 ? (
          <Stack sx={{ p: 2.25 }}>
            <Typography color="text.secondary">
              No responses are saved for this team yet.
            </Typography>
          </Stack>
        ) : (
          <DataGrid<ProjectTeamRawTableRow>
            rows={table.rows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            density="compact"
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            sx={{
              border: 0,
              "--DataGrid-overlayHeight": "140px",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(15, 23, 42, 0.04)",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontSize: 12,
                fontWeight: 800,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 12.5,
              },
              "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
                px: 0.75,
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
            }}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
}
