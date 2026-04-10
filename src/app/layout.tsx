import type { Metadata } from "next";
// if your Next version is different, MUI notes to use the matching v1X-appRouter package path
// but for current setups, v15-appRouter is the standard documented path

import ServiceWorkerRegistration from "@/components/app/pwa/ServiceWorkerRegistration";
import React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Navbar from "@/components/app/navigation/Navbar";
import ToastProvider from "@/components/app/providers/ToastProvider";
import SubmissionSyncProvider from "@/components/app/providers/SubmissionSyncProvider";
import { SyncModeProvider } from "@/components/app/providers/SyncModeProvider";
import { AuthProvider } from "@/components/app/providers/AuthProvider";

export const metadata: Metadata = {
  title: "FRC Scouting",
  description: "Offline-capable scouting app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          {/*<GridBackground*/}
          {/*    thickness={12}*/}
          {/*    size={24}*/}
          {/*>*/}
          <ToastProvider>
            <SyncModeProvider>
              <SubmissionSyncProvider>
                <AuthProvider>
                  <ServiceWorkerRegistration />
                  <Navbar />
                  {children}
                </AuthProvider>
              </SubmissionSyncProvider>
            </SyncModeProvider>
          </ToastProvider>
          {/*</GridBackground>*/}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
