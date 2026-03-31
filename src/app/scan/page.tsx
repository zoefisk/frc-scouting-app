import PageShell from "@/components/layout/PageShell";
import QrScannerPage from "@/components/match-scouting/QrScannerPage";

export default function ScanPage() {
    return (
        <PageShell maxWidth="md">
            <QrScannerPage />
        </PageShell>
    );
}
