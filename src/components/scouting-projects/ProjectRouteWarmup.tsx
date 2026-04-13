"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { projectHasConfiguredQuestionnaire } from "@/lib/scouting-projects/questionnaires/availability";
import {
  hasMatchData,
  hasPitData,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: Pick<
    ScoutingProjectDoc,
    "projectId" | "dataMode" | "formMode" | "activeQuestionnaireIds"
  > & { id: string };
};

function getProjectWarmRoutes(project: Props["project"]) {
  const routes = [`/scouting-projects/${project.id}`];

  if (
    hasMatchData(project.dataMode) &&
    projectHasConfiguredQuestionnaire(project, "match")
  ) {
    routes.push(`/scouting-projects/${project.id}/match-scouting`);
  }

  if (
    hasPitData(project.dataMode) &&
    projectHasConfiguredQuestionnaire(project, "pit")
  ) {
    routes.push(`/scouting-projects/${project.id}/pit-scouting`);
  }

  return routes;
}

function getWarmAssetUrls(html: string, route: string) {
  if (typeof DOMParser === "undefined" || typeof window === "undefined") {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const assets = new Set<string>();
  const selectors = [
    "script[src]",
    'link[rel="stylesheet"][href]',
    'link[rel="modulepreload"][href]',
    'link[as="script"][href]',
    'link[as="style"][href]',
  ];

  for (const selector of selectors) {
    doc.querySelectorAll(selector).forEach((element) => {
      const attribute =
        element.getAttribute("src") ?? element.getAttribute("href");
      if (!attribute) {
        return;
      }

      try {
        const assetUrl = new URL(attribute, window.location.origin);
        if (assetUrl.origin !== window.location.origin) {
          return;
        }

        if (
          assetUrl.pathname.startsWith("/_next/static/") ||
          assetUrl.pathname === route
        ) {
          assets.add(assetUrl.toString());
        }
      } catch (error) {
        console.error(
          "Failed to parse route warmup asset URL:",
          attribute,
          error
        );
      }
    });
  }

  return [...assets];
}

async function warmRouteAssets(route: string) {
  const response = await fetch(route, { credentials: "same-origin" });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`Failed to warm route ${route} (${response.status}).`);
  }

  if (!contentType.includes("text/html")) {
    return;
  }

  const html = await response.text();
  const assetUrls = getWarmAssetUrls(html, route);

  await Promise.allSettled(
    assetUrls.map(async (assetUrl) => {
      await fetch(assetUrl, { credentials: "same-origin" });
    })
  );
}

export default function ProjectRouteWarmup({ project }: Props) {
  const router = useRouter();
  const { effectiveOnline } = useSyncMode();
  const warmedRef = React.useRef<string>("");

  React.useEffect(() => {
    async function warmRoutes() {
      if (!effectiveOnline) {
        return;
      }

      const routes = getProjectWarmRoutes(project);
      const warmKey = routes.join("|");

      if (warmedRef.current === warmKey) {
        return;
      }

      warmedRef.current = warmKey;

      await Promise.allSettled(
        routes.map(async (route) => {
          try {
            void router.prefetch(route);
          } catch (error) {
            console.error("Failed to prefetch project route:", route, error);
          }

          try {
            await warmRouteAssets(route);
          } catch (error) {
            console.error("Failed to warm project route:", route, error);
          }
        })
      );
    }

    void warmRoutes();
  }, [effectiveOnline, project, router]);

  return null;
}
