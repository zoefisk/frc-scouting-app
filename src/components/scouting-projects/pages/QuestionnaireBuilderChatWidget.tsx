"use client";

import React from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";

type ExampleChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type MessageSegment =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "code";
      content: string;
      language: string | null;
    };

const INITIAL_CHAT_MESSAGES: ExampleChatMessage[] = [
  {
    id: "intro",
    role: "assistant",
    text: "I'm a tiny example builder helper. Ask for a field, section, or question type.",
  },
];

function buildExampleChatReply(input: string): string {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return "Ask me for something tiny like a new section, a rating field, or a yes/no question.";
  }

  if (normalized.includes("section")) {
    return "Try adding a new object to `sections`, then give it an `id`, `title`, and `fields` array.";
  }

  if (
    normalized.includes("rating") ||
    normalized.includes("1-5") ||
    normalized.includes("scale")
  ) {
    return "A quick pattern is a `rating` field with `min: 1`, `max: 5`, and a label that explains what scouts should score.";
  }

  if (
    normalized.includes("boolean") ||
    normalized.includes("checkbox") ||
    normalized.includes("yes/no")
  ) {
    return "For a yes/no prompt, use a `boolean` field. That keeps the saved data clean and easy to analyze later.";
  }

  if (
    normalized.includes("conditional") ||
    normalized.includes("show when") ||
    normalized.includes("visiblewhen")
  ) {
    return "Conditional display usually belongs in `visibleWhen`, so one answer can reveal or hide later fields.";
  }

  if (normalized.includes("help") || normalized.includes("json")) {
    return "The schema reference below is the real source of truth. This little helper is only a mock example for builder ideas.";
  }

  return "Small example answer: I would probably add that as either a new field in an existing section or a brand-new section if it changes the scouting flow.";
}

function parseMessageSegments(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const codeBlockPattern = /```([\w-]+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;

  for (const match of text.matchAll(codeBlockPattern)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      const plainText = text.slice(lastIndex, matchIndex).trim();
      if (plainText) {
        segments.push({ type: "text", content: plainText });
      }
    }

    const language = match[1]?.trim() || null;
    const code = match[2]?.trim() || "";
    if (code) {
      segments.push({
        type: "code",
        content: code,
        language,
      });
    }

    lastIndex = matchIndex + match[0].length;
  }

  const trailingText = text.slice(lastIndex).trim();
  if (trailingText) {
    segments.push({ type: "text", content: trailingText });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <Box
          key={`inline-${index}`}
          component="code"
          sx={{
            px: 0.5,
            py: 0.15,
            borderRadius: 0.75,
            bgcolor: "rgba(15, 23, 42, 0.08)",
            fontFamily:
              'ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: "0.85em",
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }

    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
}

function ChatMessageContent({ text }: { text: string }) {
  const segments = parseMessageSegments(text);

  return (
    <Stack spacing={1}>
      {segments.map((segment, index) =>
        segment.type === "code" ? (
          <Box
            key={`code-${index}`}
            sx={{
              borderRadius: 1.5,
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              bgcolor: "rgba(15, 23, 42, 0.9)",
              color: "#f8fafc",
            }}
          >
            {segment.language ? (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  px: 1,
                  py: 0.5,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(248, 250, 252, 0.7)",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {segment.language}
              </Typography>
            ) : null}
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.25,
                overflowX: "auto",
                fontSize: 12.5,
                lineHeight: 1.55,
                fontFamily:
                  'ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                whiteSpace: "pre-wrap",
              }}
            >
              {segment.content}
            </Box>
          </Box>
        ) : (
          <Typography
            key={`text-${index}`}
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {renderInlineCode(segment.content)}
          </Typography>
        )
      )}
    </Stack>
  );
}

export default function QuestionnaireBuilderChatWidget({
  projectId,
  kind,
  questionnaireName,
  definitionText,
}: {
  projectId: string;
  kind: "match" | "pit";
  questionnaireName: string;
  definitionText: string;
}) {
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<ExampleChatMessage[]>(
    INITIAL_CHAT_MESSAGES
  );
  const [chatThinking, setChatThinking] = React.useState(false);
  const [chatExpanded, setChatExpanded] = React.useState(true);

  const handleSend = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatThinking) {
      return;
    }

    const userMessage: ExampleChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");
    setChatThinking(true);

    try {
      const idToken = await getCurrentUserIdToken();

      if (!idToken) {
        throw new Error(
          "You must be signed in to use the questionnaire AI helper."
        );
      }

      const response = await fetch(
        `/api/scouting-projects/${projectId}/questionnaire-builder-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            kind,
            message: trimmed,
            questionnaireName,
            definitionText,
          }),
        }
      );

      const data = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Could not get an AI helper response.");
      }

      const assistantMessage: ExampleChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.reply,
      };

      setChatMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const fallbackMessage =
        error instanceof Error ? error.message : buildExampleChatReply(trimmed);

      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: fallbackMessage,
        },
      ]);
    } finally {
      setChatThinking(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 20 },
        bottom: { xs: 12, sm: 20 },
        width: { xs: "calc(100vw - 24px)", sm: 360 },
        maxWidth: 360,
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          overflow: "hidden",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 1.5,
            py: 1.25,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <AutoAwesomeRoundedIcon fontSize="small" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              AI Helper (Example)
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, display: "block" }}
            >
              Tiny mock chat for questionnaire ideas
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setChatExpanded((current) => !current)}
            sx={{ color: "inherit" }}
            aria-label={
              chatExpanded ? "Minimize chat helper" : "Open chat helper"
            }
          >
            {chatExpanded ? (
              <RemoveRoundedIcon fontSize="small" />
            ) : (
              <ExpandLessRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>

        {chatExpanded ? (
          <Stack spacing={1.5} sx={{ p: 1.5, bgcolor: "background.paper" }}>
            <Typography variant="body2" color="text.secondary">
              This does not edit the questionnaire yet. It just gives quick
              example suggestions.
            </Typography>

            <Stack
              spacing={1}
              sx={{
                maxHeight: 240,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor:
                      message.role === "user"
                        ? "primary.main"
                        : "rgba(15, 23, 42, 0.04)",
                    color:
                      message.role === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    border:
                      message.role === "user"
                        ? "none"
                        : "1px solid rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <ChatMessageContent text={message.text} />
                </Box>
              ))}

              {chatThinking ? (
                <Skeleton
                  variant="rounded"
                  width={220}
                  height={40}
                  sx={{ borderRadius: 2 }}
                />
              ) : null}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                fullWidth
                label="Ask the example bot"
                placeholder="Add a rating field for driver control"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => void handleSend()}
                disabled={!chatInput.trim() || chatThinking}
                endIcon={<SendRoundedIcon />}
              >
                Send
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Button
            fullWidth
            onClick={() => setChatExpanded(true)}
            endIcon={<ExpandMoreRoundedIcon />}
            sx={{
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              color: "text.secondary",
              textTransform: "none",
            }}
          >
            Open helper
          </Button>
        )}
      </Paper>
    </Box>
  );
}
