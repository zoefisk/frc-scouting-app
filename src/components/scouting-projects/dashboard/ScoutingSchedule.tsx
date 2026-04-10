import * as React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowClassNameParams,
  GridRowId,
  GridRowModel,
  GridToolbar,
} from "@mui/x-data-grid";

type AssignmentMode = "single" | "block5";

export type ScoutingScheduleMatchRow = {
  id: string;
  matchNumber: number;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
};

type DisplayRow = {
  id: string;
  startMatch: number;
  endMatch: number;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
};

type ScoutingScheduleProps = {
  rows?: ScoutingScheduleMatchRow[];
  onRowsChange?: (rows: ScoutingScheduleMatchRow[]) => void;
  availableScouters?: string[];
  title?: string;
  initialMode?: AssignmentMode;
};

const DEFAULT_SCOUTERS = [
  "Zoe",
  "Ava",
  "Mia",
  "Noah",
  "Liam",
  "Ethan",
  "Olivia",
  "Emma",
];

const DEFAULT_ROWS: ScoutingScheduleMatchRow[] = [
  {
    id: "m1",
    matchNumber: 1,
    red1: "Zoe",
    red2: "Ava",
    red3: "Mia",
    blue1: "Noah",
    blue2: "Liam",
    blue3: "Ethan",
  },
  {
    id: "m2",
    matchNumber: 2,
    red1: "Emma",
    red2: "Zoe",
    red3: "Ava",
    blue1: "Mia",
    blue2: "Noah",
    blue3: "Liam",
  },
  {
    id: "m3",
    matchNumber: 3,
    red1: "Olivia",
    red2: "Emma",
    red3: "Zoe",
    blue1: "Ava",
    blue2: "Mia",
    blue3: "Noah",
  },
  {
    id: "m4",
    matchNumber: 4,
    red1: "Liam",
    red2: "Ethan",
    red3: "Olivia",
    blue1: "Emma",
    blue2: "Zoe",
    blue3: "Ava",
  },
  {
    id: "m5",
    matchNumber: 5,
    red1: "Mia",
    red2: "Noah",
    red3: "Liam",
    blue1: "Ethan",
    blue2: "Olivia",
    blue3: "Emma",
  },
  {
    id: "m6",
    matchNumber: 6,
    red1: "Zoe",
    red2: "Ava",
    red3: "Mia",
    blue1: "Noah",
    blue2: "Liam",
    blue3: "Ethan",
  },
  {
    id: "m7",
    matchNumber: 7,
    red1: "Emma",
    red2: "Zoe",
    red3: "Ava",
    blue1: "Mia",
    blue2: "Noah",
    blue3: "Liam",
  },
  {
    id: "m8",
    matchNumber: 8,
    red1: "Olivia",
    red2: "Emma",
    red3: "Zoe",
    blue1: "Ava",
    blue2: "Mia",
    blue3: "Noah",
  },
  {
    id: "m9",
    matchNumber: 9,
    red1: "Liam",
    red2: "Ethan",
    red3: "Olivia",
    blue1: "Emma",
    blue2: "Zoe",
    blue3: "Ava",
  },
  {
    id: "m10",
    matchNumber: 10,
    red1: "Mia",
    red2: "Noah",
    red3: "Liam",
    blue1: "Ethan",
    blue2: "Olivia",
    blue3: "Emma",
  },
];

function buildDisplayRows(
  sourceRows: ScoutingScheduleMatchRow[],
  mode: AssignmentMode
): DisplayRow[] {
  const sorted = [...sourceRows].sort((a, b) => a.matchNumber - b.matchNumber);

  if (mode === "single") {
    return sorted.map((row) => ({
      id: row.id,
      startMatch: row.matchNumber,
      endMatch: row.matchNumber,
      red1: row.red1,
      red2: row.red2,
      red3: row.red3,
      blue1: row.blue1,
      blue2: row.blue2,
      blue3: row.blue3,
    }));
  }

  const blocks: DisplayRow[] = [];

  for (let i = 0; i < sorted.length; i += 5) {
    const blockRows = sorted.slice(i, i + 5);
    const first = blockRows[0];

    if (!first) continue;

    blocks.push({
      id: `block-${first.matchNumber}-${blockRows[blockRows.length - 1].matchNumber}`,
      startMatch: first.matchNumber,
      endMatch: blockRows[blockRows.length - 1].matchNumber,
      red1: first.red1,
      red2: first.red2,
      red3: first.red3,
      blue1: first.blue1,
      blue2: first.blue2,
      blue3: first.blue3,
    });
  }

  return blocks;
}

function getAssignmentWindowLabel(row: DisplayRow): string {
  return row.startMatch === row.endMatch
    ? `Match ${row.startMatch}`
    : `Matches ${row.startMatch}-${row.endMatch}`;
}

export default function ScoutingSchedule({
  rows,
  onRowsChange,
  availableScouters = DEFAULT_SCOUTERS,
  title = "Scouting Schedule",
  initialMode = "single",
}: ScoutingScheduleProps) {
  const [localRows, setLocalRows] = React.useState<ScoutingScheduleMatchRow[]>(
    rows ?? DEFAULT_ROWS
  );
  const [assignmentMode, setAssignmentMode] =
    React.useState<AssignmentMode>(initialMode);

  React.useEffect(() => {
    if (rows) {
      setLocalRows(rows);
    }
  }, [rows]);

  const sortedLocalRows = React.useMemo(
    () => [...localRows].sort((a, b) => a.matchNumber - b.matchNumber),
    [localRows]
  );

  const displayRows = React.useMemo(
    () => buildDisplayRows(sortedLocalRows, assignmentMode),
    [sortedLocalRows, assignmentMode]
  );

  const pushRowsUpdate = React.useCallback(
    (updatedRows: ScoutingScheduleMatchRow[]) => {
      const sorted = [...updatedRows].sort(
        (a, b) => a.matchNumber - b.matchNumber
      );
      setLocalRows(sorted);
      onRowsChange?.(sorted);
    },
    [onRowsChange]
  );

  const processRowUpdate = React.useCallback(
    (newRow: DisplayRow, oldRow: DisplayRow) => {
      const updatedSourceRows = [...sortedLocalRows];

      if (assignmentMode === "single") {
        const targetIndex = updatedSourceRows.findIndex(
          (row) => row.matchNumber === oldRow.startMatch
        );

        if (targetIndex !== -1) {
          updatedSourceRows[targetIndex] = {
            ...updatedSourceRows[targetIndex],
            matchNumber: Number(newRow.startMatch),
            red1: newRow.red1,
            red2: newRow.red2,
            red3: newRow.red3,
            blue1: newRow.blue1,
            blue2: newRow.blue2,
            blue3: newRow.blue3,
          };
        }

        pushRowsUpdate(updatedSourceRows);

        return {
          ...newRow,
          endMatch: newRow.startMatch,
        };
      }

      for (let i = 0; i < updatedSourceRows.length; i += 1) {
        const row = updatedSourceRows[i];
        if (
          row.matchNumber >= oldRow.startMatch &&
          row.matchNumber <= oldRow.endMatch
        ) {
          updatedSourceRows[i] = {
            ...row,
            red1: newRow.red1,
            red2: newRow.red2,
            red3: newRow.red3,
            blue1: newRow.blue1,
            blue2: newRow.blue2,
            blue3: newRow.blue3,
          };
        }
      }

      pushRowsUpdate(updatedSourceRows);
      return newRow;
    },
    [assignmentMode, pushRowsUpdate, sortedLocalRows]
  );

  const handleProcessRowUpdateError = React.useCallback((error: unknown) => {
    console.error("Failed to update scouting schedule row:", error);
  }, []);

  const columns = React.useMemo<GridColDef<DisplayRow>[]>(
    () => [
      {
        field: "assignmentWindow",
        headerName: "Assignment Window",
        minWidth: 180,
        flex: 1.15,
        sortable: false,
        filterable: false,
        editable: false,
        renderCell: (params: GridRenderCellParams<DisplayRow>) => {
          const row = params.row;
          const isSingle = row.startMatch === row.endMatch;

          return (
            <Chip
              label={getAssignmentWindowLabel(row)}
              size="small"
              sx={{
                fontWeight: 700,
                minWidth: isSingle ? 110 : 145,
                borderRadius: 999,
                bgcolor: isSingle ? "grey.100" : "secondary.light",
                color: isSingle ? "text.primary" : "secondary.contrastText",
              }}
            />
          );
        },
      },
      {
        field: "startMatch",
        headerName: "Match #",
        type: "number",
        editable: assignmentMode === "single",
        width: 95,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "red1",
        headerName: "Red 1",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-red",
        cellClassName: "schedule-cell-red",
      },
      {
        field: "red2",
        headerName: "Red 2",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-red",
        cellClassName: "schedule-cell-red",
      },
      {
        field: "red3",
        headerName: "Red 3",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-red",
        cellClassName: "schedule-cell-red schedule-divider-right",
      },
      {
        field: "blue1",
        headerName: "Blue 1",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-blue",
        cellClassName: "schedule-cell-blue",
      },
      {
        field: "blue2",
        headerName: "Blue 2",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-blue",
        cellClassName: "schedule-cell-blue",
      },
      {
        field: "blue3",
        headerName: "Blue 3",
        type: "singleSelect",
        editable: true,
        valueOptions: availableScouters,
        flex: 1,
        minWidth: 120,
        headerClassName: "schedule-header-blue",
        cellClassName: "schedule-cell-blue",
      },
    ],
    [assignmentMode, availableScouters]
  );

  const getRowClassName = React.useCallback(
    (params: GridRowClassNameParams<DisplayRow>) => {
      const blockIndex = Math.floor((params.row.startMatch - 1) / 5);
      return blockIndex % 2 === 0
        ? "schedule-block-even"
        : "schedule-block-odd";
    },
    []
  );

  return (
    <Paper sx={{ p: 2.5, borderRadius: 4 }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Edit assignments directly in the grid. In 5-match mode, changing a
              row updates every match in that block.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip
              label={`${sortedLocalRows.length} total matches`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={
                assignmentMode === "single"
                  ? `${displayRows.length} visible rows`
                  : `${displayRows.length} visible blocks`
              }
              variant="outlined"
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="assignment-mode-label">
                Assignment Mode
              </InputLabel>
              <Select
                labelId="assignment-mode-label"
                value={assignmentMode}
                label="Assignment Mode"
                onChange={(event) =>
                  setAssignmentMode(event.target.value as AssignmentMode)
                }
              >
                <MenuItem value="single">Single match</MenuItem>
                <MenuItem value="block5">5-match blocks</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Box sx={{ width: "100%" }}>
          <DataGrid<DisplayRow>
            rows={displayRows}
            columns={columns}
            editMode="row"
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            getRowClassName={getRowClassName}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                  page: 0,
                },
              },
              sorting: {
                sortModel: [{ field: "startMatch", sort: "asc" }],
              },
            }}
            slots={{
              toolbar: GridToolbar,
            }}
            sx={{
              border: 0,
              "--DataGrid-overlayHeight": "220px",
              "& .MuiDataGrid-toolbarContainer": {
                px: 1,
                py: 0.5,
              },
              "& .MuiDataGrid-columnHeaders": {
                borderRadius: 2,
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
              "& .schedule-header-red": {
                bgcolor: "error.light",
                color: "error.contrastText",
                fontWeight: 800,
              },
              "& .schedule-header-blue": {
                bgcolor: "info.light",
                color: "info.contrastText",
                fontWeight: 800,
              },
              "& .schedule-cell-red": {
                bgcolor: "rgba(244, 67, 54, 0.04)",
              },
              "& .schedule-cell-blue": {
                bgcolor: "rgba(33, 150, 243, 0.04)",
              },
              "& .schedule-divider-right": {
                borderRight: (theme) => `2px solid ${theme.palette.divider}`,
              },
              "& .schedule-block-even": {
                bgcolor: "rgba(156, 39, 176, 0.035)",
              },
              "& .schedule-block-odd": {
                bgcolor: "background.paper",
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
