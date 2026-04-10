export type TeamOption = {
  key: string;
  team_number: number;
  nickname?: string;
  name?: string;
};

export async function loadEventTeams(eventKey: string): Promise<TeamOption[]> {
  const res = await fetch(
    `/api/tba/event-teams/${encodeURIComponent(eventKey)}`
  );

  if (!res.ok) {
    throw new Error("Failed to load teams.");
  }

  return (await res.json()) as TeamOption[];
}
