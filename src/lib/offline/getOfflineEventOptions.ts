import { getOfflineEvents, type OfflineEventRecord } from "@/lib/db";

export type OfflineEventOption = {
    key: string;
    name: string;
};

export async function getOfflineEventOptions(
    year: string
): Promise<OfflineEventOption[]> {
    const events = await getOfflineEvents<OfflineEventRecord[]>();

    return events
        .filter((event) => String(event.year) === year)
        .map((event) => ({
            key: event.eventKey,
            name: event.eventName,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}
