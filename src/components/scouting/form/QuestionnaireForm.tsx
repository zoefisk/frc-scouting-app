"use client";

import React from "react";
import { Alert, Box, Button, Stack } from "@mui/material";

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaires/types";
import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaires/validators";
import SectionRenderer from "./SectionRenderer";

type Props = {
  definition: QuestionnaireDefinition;
  initialAnswers?: QuestionnaireAnswers;
  submitLabel?: string;
  onSubmit: (answers: QuestionnaireAnswers) => void | Promise<void>;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
};

export default function QuestionnaireForm({
  definition,
  initialAnswers = {},
  submitLabel = "Submit",
  onSubmit,
  onAnswersChange,
}: Props) {
  const [answers, setAnswers] =
    React.useState<QuestionnaireAnswers>(initialAnswers);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const handleChange = React.useCallback(
    (fieldId: string, value: unknown) => {
      setAnswers((prev) => {
        const next = {
          ...prev,
          [fieldId]: value,
        };

        onAnswersChange?.(next);
        return next;
      });

      setErrors((prev) => {
        if (!prev[fieldId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    },
    [onAnswersChange]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateQuestionnaireAnswers(definition, answers);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(answers);
    } catch (error) {
      console.error("Questionnaire submission failed:", error);
      setSubmitError("Could not submit questionnaire.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        {definition.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            answers={answers}
            errors={errors}
            onChange={handleChange}
          />
        ))}

        <Box>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
