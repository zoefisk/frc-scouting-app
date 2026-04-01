"use client";

import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/navigation";

type TeamRow = {
  key: string;
  teamNumber: number;
  nickname: string;
  rank: number | null;
};

type Props = {
  eventKey: string;
  teams: TeamRow[];
};

export default function TeamsTable({ eventKey, teams }: Props) {
  const router = useRouter();

  const handleNavigate = (teamKey: string) => {
    router.push(`/analysis/${eventKey}/teams/${teamKey}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Rank</strong>
            </TableCell>
            <TableCell>
              <strong>Team #</strong>
            </TableCell>
            <TableCell>
              <strong>Nickname</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.key}
              hover
              onClick={() => handleNavigate(team.key)}
              sx={{
                cursor: "pointer",
                transition: "background-color 0.15s ease, transform 0.15s ease",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <TableCell>{team.rank ?? "-"}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{team.teamNumber}</TableCell>
              <TableCell>{team.nickname || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
