"use client";

import PageShell from "@/components/app/layout/PageShell";
import LoginPageContent from "@/components/auth/pages/LoginPageContent";

export default function LoginPage() {
  return (
    <PageShell width="sm">
      <LoginPageContent />
    </PageShell>
  );
}
