import PageShell from "@/components/app/layout/PageShell";
import OfflineEventsManager from "@/components/offline/OfflineEventsManager";

export default function OfflineEventsPage() {
  return (
    <PageShell width="lg">
      <OfflineEventsManager />
    </PageShell>
  );
}
