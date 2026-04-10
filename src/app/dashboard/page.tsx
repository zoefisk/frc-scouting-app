import React from "react";
import PageShell from "@/components/app/layout/PageShell";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <PageShell width="xl">
        <DashboardPageClient />
      </PageShell>
    </RequireAuth>
  );
}
