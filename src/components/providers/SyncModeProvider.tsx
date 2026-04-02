"use client";

import React from "react";
import { getAppSetting, saveAppSetting } from "@/old-lib/db";
import { useToast } from "@/old-lib/hooks/useToast";

type SyncMode = "online" | "forced_offline";

type SyncModeContextValue = {
  actualOnline: boolean;
  syncMode: SyncMode;
  effectiveOnline: boolean;
  toggleSyncMode: () => Promise<void>;
  setSyncMode: (mode: SyncMode) => Promise<void>;
};

const SyncModeContext = React.createContext<SyncModeContextValue | null>(null);

export function SyncModeProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  const [actualOnline, setActualOnline] = React.useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [syncMode, setSyncModeState] = React.useState<SyncMode>("online");
  const [loaded, setLoaded] = React.useState(false);

  const previousActualOnlineRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    async function loadPreference() {
      try {
        const saved = await getAppSetting<SyncMode>("syncMode");
        if (saved === "forced_offline" || saved === "online") {
          setSyncModeState(saved);
        }
      } finally {
        setLoaded(true);
      }
    }

    loadPreference();
  }, []);

  React.useEffect(() => {
    const goOnline = () => setActualOnline(true);
    const goOffline = () => setActualOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  React.useEffect(() => {
    if (!loaded) return;

    if (previousActualOnlineRef.current === null) {
      previousActualOnlineRef.current = actualOnline;
      return;
    }

    if (previousActualOnlineRef.current !== actualOnline) {
      if (actualOnline) {
        toast.success("Back online.");
      } else {
        toast.warning("You are offline.");
      }
    }

    previousActualOnlineRef.current = actualOnline;
  }, [actualOnline, loaded, toast]);

  const setSyncMode = React.useCallback(async (mode: SyncMode) => {
    setSyncModeState(mode);
    await saveAppSetting("syncMode", mode);
    window.location.reload();
  }, []);

  const toggleSyncMode = React.useCallback(async () => {
    const nextMode = syncMode === "online" ? "forced_offline" : "online";
    setSyncModeState(nextMode);
    await saveAppSetting("syncMode", nextMode);

    window.location.reload();
  }, [syncMode]);

  const value = React.useMemo(
    () => ({
      actualOnline,
      syncMode,
      effectiveOnline: actualOnline && syncMode === "online",
      toggleSyncMode,
      setSyncMode,
    }),
    [actualOnline, syncMode, toggleSyncMode, setSyncMode]
  );

  if (!loaded) return null;

  return (
    <SyncModeContext.Provider value={value}>
      {children}
    </SyncModeContext.Provider>
  );
}

export function useSyncMode() {
  const context = React.useContext(SyncModeContext);
  if (!context) {
    throw new Error("useSyncMode must be used within SyncModeProvider");
  }
  return context;
}
