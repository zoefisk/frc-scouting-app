import { MatchScoutingEntryDoc } from "@/lib/firebase/shared/types";

export type TeamTeleopSummary = {
    averageScoringEffectiveness: number;
    averageAccuracy: number;
    averageCycleSpeed: number;
    averageDriverControl: number;
    averageDefenseAbility: number;
    averageDefenseResistance: number;
    climbCounts: Record<string, number>;
};

function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageNullable(values: Array<number | null | undefined>): number {
    const filtered = values.filter((v): v is number => typeof v === "number");
    return average(filtered);
}

export function buildTeamTeleopSummary(entries: MatchScoutingEntryDoc[]): TeamTeleopSummary {
    const presentEntries = entries.filter((entry) => entry.teamPresence === "present");

    const climbCounts: Record<string, number> = {
        not_attempted: 0,
        failed: 0,
        l1: 0,
        l2: 0,
        l3: 0,
    };

    for (const entry of presentEntries) {
        const climb = entry.teleop?.climb;
        if (climb && climb in climbCounts) {
            climbCounts[climb] += 1;
        }
    }

    return {
        averageScoringEffectiveness: averageNullable(
            presentEntries.map((entry) => entry.teleop?.scoringEffectiveness)
        ),
        averageAccuracy: averageNullable(
            presentEntries.map((entry) => entry.teleop?.scoringAccuracy)
        ),
        averageCycleSpeed: averageNullable(
            presentEntries.map((entry) => entry.teleop?.cycleSpeed)
        ),
        averageDriverControl: averageNullable(
            presentEntries.map((entry) => entry.teleop?.driverControl)
        ),
        averageDefenseAbility: averageNullable(
            presentEntries.map((entry) =>
                entry.teleop?.playedDefense ? entry.teleop?.defenseAbility ?? null : null
            )
        ),
        averageDefenseResistance: averageNullable(
            presentEntries.map((entry) =>
                entry.teleop?.wasDefended ? entry.teleop?.defenseResistance ?? null : null
            )
        ),
        climbCounts,
    };
}
