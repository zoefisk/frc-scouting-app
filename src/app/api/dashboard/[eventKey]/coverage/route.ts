import { NextResponse } from "next/server";
import {getEventQualificationMatches} from "@/lib/tba/server/eventQualificationMatches";
import {getAllMatchScoutingEntriesForEvent} from "@/lib/firebase/server/entries";
import {buildCoverageWarnings} from "@/lib/analysis/dashboard/buildCoverageWarnings";

type RouteProps = {
    params: Promise<{
        eventKey: string;
    }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
    try {
        const { eventKey } = await params;

        const [matches, entries] = await Promise.all([
            getEventQualificationMatches(eventKey),
            getAllMatchScoutingEntriesForEvent(eventKey),
        ]);

        const warnings = buildCoverageWarnings(matches, entries);

        const incomplete = warnings.filter((warning) => !warning.isComplete);
        const currentMatch =
            incomplete.length > 0
                ? incomplete[0].matchNumber
                : warnings.length > 0
                    ? warnings[warnings.length - 1].matchNumber
                    : null;

        return NextResponse.json({
            eventKey,
            currentMatch,
            warnings,
        });
    } catch (error) {
        console.error("Dashboard coverage route failed:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Failed to load dashboard coverage data.";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
