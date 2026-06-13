import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  getAlliancePerfFieldId,
  PERF_FIELDS,
} from "@/lib/scouting/performanceRatings";
import type { QuestionnaireAnswers } from "@/lib/scouting/questionnaire/types";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const NA_RATING_VALUE = "na";

type Props = {
  answers: QuestionnaireAnswers;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
  mode?: "robot" | "alliance";
  teams?: TeamOption[];
  /** When true, all inputs are disabled (used in the questionnaire builder preview). */
  locked?: boolean;
};

export default function PerformanceRatingsCard({
  answers,
  onAnswersChange,
  mode = "robot",
  teams = [],
  locked = false,
}: Props) {
  const handleChange = (fieldId: string, value: number | string | null) => {
    if (locked) return;
    onAnswersChange?.({ ...answers, [fieldId]: value });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <div>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Performance Ratings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mode === "alliance"
                  ? "Rate each robot on the alliance in each area (1-5 or N/A). These ratings can later feed team analysis for every robot on the scouted alliance."
                  : "Rate the team&apos;s performance in each area (1-5 or N/A). These ratings power the team radar chart in project analysis."}
              </Typography>
            </div>
            <Chip
              icon={<LockOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label="Built-in"
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary", flexShrink: 0, mt: 0.25 }}
            />
          </Stack>

          {mode === "alliance" ? (
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems="stretch"
            >
              {teams.map((team) => (
                <Card
                  key={team.key}
                  variant="outlined"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        #{team.team_number}{" "}
                        {team.nickname ?? team.name ?? team.key}
                      </Typography>

                      {PERF_FIELDS.map((field) => {
                        const answerKey = getAlliancePerfFieldId(
                          team.key,
                          field.id
                        );
                        const value = answers[answerKey];
                        const selectedValue =
                          typeof value === "number" || value === NA_RATING_VALUE
                            ? value
                            : null;

                        return (
                          <div key={answerKey}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, mb: 0.75 }}
                            >
                              {field.label}
                            </Typography>
                            <ToggleButtonGroup
                              exclusive
                              value={selectedValue}
                              onChange={(
                                _,
                                nextValue: number | string | null
                              ) => handleChange(answerKey, nextValue)}
                              size="small"
                              disabled={locked}
                            >
                              {RATING_OPTIONS.map((option) => (
                                <ToggleButton key={option} value={option}>
                                  {option}
                                </ToggleButton>
                              ))}
                              <ToggleButton value={NA_RATING_VALUE}>
                                N/A
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </div>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            PERF_FIELDS.map((field) => {
              const value = answers[field.id];
              const selectedValue =
                typeof value === "number" || value === NA_RATING_VALUE
                  ? value
                  : null;

              return (
                <div key={field.id}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 0.75 }}
                  >
                    {field.label}
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={selectedValue}
                    onChange={(_, nextValue: number | string | null) =>
                      handleChange(field.id, nextValue)
                    }
                    size="small"
                    disabled={locked}
                  >
                    {RATING_OPTIONS.map((option) => (
                      <ToggleButton key={option} value={option}>
                        {option}
                      </ToggleButton>
                    ))}
                    <ToggleButton value={NA_RATING_VALUE}>N/A</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              );
            })
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
