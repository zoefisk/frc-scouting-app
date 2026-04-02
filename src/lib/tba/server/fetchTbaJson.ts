function getTbaHeaders() {
  const apiKey = process.env.TBA_API_KEY ?? process.env.TBA_KEY;

  if (!apiKey) {
    throw new Error("Missing TBA API key.");
  }

  return {
    "X-TBA-Auth-Key": apiKey,
  };
}

export async function fetchTbaJson<T>(path: string): Promise<T> {
  const res = await fetch(`https://www.thebluealliance.com/api/v3${path}`, {
    headers: getTbaHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TBA request failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}
