"use client";

import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

import type {
  QuestionnaireAnswers,
  QuestionnaireSectionDefinition,
} from "@/lib/scouting/questionnaires/types";
import { isFieldVisible } from "@/lib/scouting/questionnaires/validators";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
  section: QuestionnaireSectionDefinition;
  answers: QuestionnaireAnswers;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: unknown) => void;
};

export default function SectionRenderer({
  section,
  answers,
  errors,
  onChange,
}: Props) {
  const visibleFields = section.fields.filter((field) =>
    isFieldVisible(field, answers)
  );

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2.5}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {section.title}
            </Typography>

            {section.description && (
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            )}
          </div>

          {visibleFields.map((field) => (
            <QuestionRenderer
              key={field.id}
              field={field}
              value={answers[field.id]}
              error={errors[field.id]}
              onChange={(value) => onChange(field.id, value)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
