import { Paper, Stack, Typography } from "@mui/material";
import { TeamAutoSummary } from "@/old-lib/analysis/team/buildTeamAutoSummary";
import { TeamTeleopSummary } from "@/old-lib/analysis/team/buildTeamTeleopSummary";
import { TeamRadarSummary } from "@/old-lib/analysis/team/buildTeamRadarMetrics";

type Props = {
  autoSummary: TeamAutoSummary;
  teleopSummary: TeamTeleopSummary;
  radarSummary: TeamRadarSummary;
};

export default function TeamStrengthsWeaknessesCard({
  autoSummary,
  teleopSummary,
  radarSummary,
}: Props) {
  const strengths: string[] = [];
  const concerns: string[] = [];

  if (teleopSummary.averageDriverControl >= 4) {
    strengths.push("Strong driver control");
  }
  if (teleopSummary.averageCycleSpeed >= 4) {
    strengths.push("Fast cycle speed");
  }
  if (teleopSummary.averageScoringEffectiveness >= 4) {
    strengths.push("Effective teleop scoring");
  }
  if (teleopSummary.averageDefenseResistance >= 4) {
    strengths.push("Handles defense well");
  }
  if (
    autoSummary.mobilityTotal > 0 &&
    autoSummary.mobilityYesCount / autoSummary.mobilityTotal >= 0.75
  ) {
    strengths.push("Reliable mobility in auto");
  }

  if (
    teleopSummary.averageDriverControl > 0 &&
    teleopSummary.averageDriverControl < 3
  ) {
    concerns.push("Driver control looks inconsistent");
  }
  if (
    teleopSummary.averageCycleSpeed > 0 &&
    teleopSummary.averageCycleSpeed < 3
  ) {
    concerns.push("Cycle speed may be slow");
  }
  if (
    teleopSummary.averageScoringEffectiveness > 0 &&
    teleopSummary.averageScoringEffectiveness < 3
  ) {
    concerns.push("Scoring effectiveness looks limited");
  }
  if (
    teleopSummary.averageDefenseResistance > 0 &&
    teleopSummary.averageDefenseResistance < 3
  ) {
    concerns.push("May struggle against defense");
  }
  if (radarSummary.sampleSize <= 1) {
    concerns.push("Very limited scouting sample size");
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Snapshot
        </Typography>

        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 600 }}>Strengths</Typography>
          {strengths.length > 0 ? (
            strengths.map((item) => (
              <Typography key={item}>• {item}</Typography>
            ))
          ) : (
            <Typography color="text.secondary">
              No clear strengths identified yet.
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 600 }}>Concerns</Typography>
          {concerns.length > 0 ? (
            concerns.map((item) => <Typography key={item}>• {item}</Typography>)
          ) : (
            <Typography color="text.secondary">
              No major concerns identified yet.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
