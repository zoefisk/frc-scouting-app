import "server-only";

const TBA_BASE_URL = "https://www.thebluealliance.com/api/v3";

function getTbaApiKey(): string {
  const apiKey = process.env.TBA_KEY;

  if (!apiKey) {
    throw new Error("Missing TBA API key.");
  }

  return apiKey;
}

function getTbaHeaders() {
  return {
    "X-TBA-Auth-Key": getTbaApiKey(),
  };
}

export async function fetchTbaJson<T>(path: string): Promise<T> {
  const response = await fetch(`${TBA_BASE_URL}${path}`, {
    headers: getTbaHeaders(),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TBA request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}
