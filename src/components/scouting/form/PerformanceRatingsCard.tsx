"use client";

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

import { PERF_FIELDS } from "@/lib/scouting/performanceRatings";
import type { QuestionnaireAnswers } from "@/lib/scouting/questionnaire/types";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

type Props = {
  answers: QuestionnaireAnswers;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
  /** When true, all inputs are disabled (used in the questionnaire builder preview). */
  locked?: boolean;
};

export default function PerformanceRatingsCard({
  answers,
  onAnswersChange,
  locked = false,
}: Props) {
  const handleChange = (fieldId: string, value: number | null) => {
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
                Rate the team&apos;s performance in each area (1–5). These
                ratings power the team radar chart in project analysis.
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

          {PERF_FIELDS.map((field) => {
            const value = answers[field.id];
            const numericValue = typeof value === "number" ? value : null;

            return (
              <div key={field.id}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
                  {field.label}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={numericValue}
                  onChange={(_, nextValue: number | null) =>
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
                </ToggleButtonGroup>
              </div>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
