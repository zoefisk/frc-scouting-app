import React from "react";
import { Alert, Box, Button, Stack } from "@mui/material";

import { validateQuestionnaireAnswers } from "@/lib/scouting/questionnaire/validators";
import SectionRenderer from "./SectionRenderer";
import {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";

type Props = {
  definition: QuestionnaireDefinition;
  answers: QuestionnaireAnswers;
  submitLabel?: string;
  showSubmitButton?: boolean;
  onSubmit: (answers: QuestionnaireAnswers) => void | Promise<void>;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
};

export default function QuestionnaireForm({
  definition,
  answers,
  submitLabel = "Submit",
  showSubmitButton = true,
  onSubmit,
  onAnswersChange,
}: Props) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const handleChange = React.useCallback(
    (fieldId: string, value: unknown) => {
      const next = {
        ...answers,
        [fieldId]: value,
      };

      onAnswersChange?.(next);

      setErrors((prev) => {
        if (!prev[fieldId]) {
          return prev;
        }

        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    },
    [answers, onAnswersChange]
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

        {showSubmitButton && (
          <Box>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
