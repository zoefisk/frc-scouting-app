import PageShell from "@/components/layout/PageShell";
import RequireAuth from "@/components/auth/RequireAuth";
import UserSettingsPage from "@/components/settings/UserSettingsPage";

export default function SettingsPage() {
    return (
        <RequireAuth>
            <PageShell width="md">
                <UserSettingsPage />
            </PageShell>
        </RequireAuth>
    );
}
