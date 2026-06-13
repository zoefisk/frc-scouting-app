import "server-only";

type QuestionnaireBuilderChatParams = {
  message: string;
  kind: "match" | "pit";
  projectName: string;
  eventKey: string;
  questionnaireName: string;
  definitionText: string;
  matchCollectionMode?: string | null;
};

type OpenAiResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractOutputText(data: OpenAiResponsesApiResult): string {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textParts =
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => {
        if (typeof content.text === "string") {
          return content.text.trim();
        }

        return "";
      })
      .filter(Boolean) ?? [];

  return textParts.join("\n\n").trim();
}

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it to your local env file and deployment environment variables."
    );
  }

  return apiKey;
}

function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildQuestionnaireBuilderInstructions() {
  return [
    "You are helping an FRC scouting app owner edit a questionnaire JSON definition.",
    "Be concise, practical, and specific.",
    "Do not claim that you directly changed the questionnaire.",
    "If you suggest JSON, keep it small and valid.",
    "The supported field types are text, number, select, boolean, and rating.",
    "Each field supports id, label, optional required, optional helpText, and optional visibleWhen.",
    "A questionnaire has id, name, version, optional description, and sections.",
    "Each section has id, title, optional description, and fields.",
    "If the user asks for something unsupported by the schema, say so clearly and suggest the closest supported alternative.",
    "Prefer answering in plain English first, then a short JSON snippet if useful.",
  ].join(" ");
}

function buildQuestionnaireBuilderInput({
  message,
  kind,
  projectName,
  eventKey,
  questionnaireName,
  definitionText,
  matchCollectionMode,
}: QuestionnaireBuilderChatParams) {
  return [
    `Project: ${projectName}`,
    `Event: ${eventKey}`,
    `Questionnaire kind: ${kind}`,
    `Questionnaire name: ${questionnaireName || "(untitled)"}`,
    kind === "match"
      ? `Match collection mode: ${matchCollectionMode ?? "robot"}`
      : null,
    "",
    "Current questionnaire JSON:",
    "```json",
    definitionText.slice(0, 12000),
    "```",
    "",
    "User request:",
    message,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function getQuestionnaireBuilderChatReply(
  params: QuestionnaireBuilderChatParams
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      store: false,
      text: {
        format: {
          type: "text",
        },
      },
      instructions: buildQuestionnaireBuilderInstructions(),
      input: buildQuestionnaireBuilderInput(params),
    }),
  });

  const data = (await response.json()) as OpenAiResponsesApiResult & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      data.error?.message ?? `OpenAI request failed (${response.status}).`
    );
  }

  const reply = extractOutputText(data);

  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}
