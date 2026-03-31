import { ScoutingPosition, TbaMatch } from "./types";

export function getTeamNumberFromPosition(
    match: TbaMatch,
    scoutingPosition: Exclude<ScoutingPosition, "">
): number | null {
    const alliance = scoutingPosition.startsWith("blue") ? "blue" : "red";
    const index = Number(scoutingPosition.slice(-1)) - 1;

    const teamKey = match.alliances[alliance].team_keys[index];
    if (!teamKey) return null;

    return Number(teamKey.replace("frc", ""));
}
