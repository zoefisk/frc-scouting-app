export type AutoMobility = "yes" | "no" | "not_sure" | null;

export type AutoGamePieceOutcome =
    | "none"
    | "collect_failed"
    | "collected_only"
    | "score_failed"
    | "scored"
    | "not_sure"
    | null;

export type AutoClimbResult =
    | "not_attempted"
    | "failed"
    | "l1"
    | "l2"
    | "l3"
    | null;

export type AutonomousData = {
    mobility: AutoMobility;
    gamePieceOutcome: AutoGamePieceOutcome;
    climb: AutoClimbResult;
    alliancePointShare: number;
    notes: string;
};
