"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/lib/hooks/useToast";

export function useNetworkStatus() {
  const toast = useToast();
  const prevOnlineRef = useRef<boolean | null>(null);

  useEffect(() => {
    function handleStatusChange() {
      const isOnline = navigator.onLine;

      // skip initial mount
      if (prevOnlineRef.current === null) {
        prevOnlineRef.current = isOnline;
        return;
      }

      if (isOnline) {
        toast.success("Back online");
      } else {
        toast.warning("You are offline");
      }

      prevOnlineRef.current = isOnline;
    }

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, [toast]);
}
