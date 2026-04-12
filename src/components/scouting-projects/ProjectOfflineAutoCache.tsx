"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { getProjectOfflineAutoRefresh } from "@/lib/db/offlineProjects";
import { downloadProjectBundle } from "@/lib/offline/downloadProjectBundle";

type Props = {
  projectId: string;
};

export default function ProjectOfflineAutoCache({ projectId }: Props) {
  const pathname = usePathname();
  const { effectiveOnline } = useSyncMode();
  const lastRunRef = React.useRef<string>("");

  React.useEffect(() => {
    async function maybeRefresh() {
      if (!effectiveOnline) {
        return;
      }

      const autoRefreshEnabled = await getProjectOfflineAutoRefresh(projectId);
      if (!autoRefreshEnabled) {
        return;
      }

      const runKey = `${projectId}:${pathname}`;
      if (lastRunRef.current === runKey) {
        return;
      }

      lastRunRef.current = runKey;

      try {
        await downloadProjectBundle(projectId);
      } catch (error) {
        console.error("Failed to auto-refresh offline project cache:", error);
      }
    }

    void maybeRefresh();
  }, [effectiveOnline, pathname, projectId]);

  return null;
}
