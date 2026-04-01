import { MatchScoutingPayload } from "@/components/match-scouting/types";
import {Button} from "@mui/material";

type Props = {
    payload: MatchScoutingPayload;
};

export default function ScoutingDownloadCsvButton({ payload }: Props) {
    const handleDownloadCsv = () => {
        const csvPayload = {
            eventKey: payload.eventKey,
            matchNumber: payload.matchNumber,
            scoutingPosition: payload.scoutingPosition,
            selectedTeamKey: payload.selectedTeamKey,
            robotPosition: payload.robotPosition,
            teamPresence: payload.teamPresence,
            ...payload.autoData,
            ...payload.teleopData,
            ...payload.finalCommentsData,
        };

        const headers = Object.keys(csvPayload);
        const values = Object.values(csvPayload).map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
        );

        const csv = [headers.join(","), values.join(",")].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scouting-${payload.eventKey}-${payload.matchNumber || "match"}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Button variant="outlined" onClick={handleDownloadCsv}>
            Download CSV
        </Button>
    );
}
