import PageShell from "@/components/layout/PageShell";
import AlliancePicker from "@/components/alliance/AlliancePicker";

export default function AlliancePickerPage() {
  return (
    <PageShell>
      <AlliancePicker myTeamNumber={3461} defaultYear={2026} />
    </PageShell>
  );
}
