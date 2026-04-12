"use client";

import {
  getAppSetting,
  getOfflineProjectBundle,
  getOfflineProjectBundles,
  removeOfflineProjectBundle,
  saveAppSetting,
  saveOfflineProjectBundle,
  type OfflineProjectBundleRecord,
} from "@/lib/db/indexDb";

const PROJECT_OFFLINE_AUTO_REFRESH_KEY_PREFIX =
  "scouting-projects:offline-auto-refresh:";

export type { OfflineProjectBundleRecord };

export async function getOfflineProjectBundleRecord(projectId: string) {
  return getOfflineProjectBundle<OfflineProjectBundleRecord>(projectId);
}

export async function getOfflineProjectBundleRecords() {
  return getOfflineProjectBundles<OfflineProjectBundleRecord[]>();
}

export async function saveOfflineProjectBundleRecord(
  bundle: OfflineProjectBundleRecord
) {
  await saveOfflineProjectBundle(bundle);
}

export async function removeOfflineProjectBundleRecord(projectId: string) {
  await removeOfflineProjectBundle(projectId);
}

export async function getProjectOfflineAutoRefresh(projectId: string) {
  const saved = await getAppSetting<boolean>(
    `${PROJECT_OFFLINE_AUTO_REFRESH_KEY_PREFIX}${projectId}`
  );

  return saved ?? true;
}

export async function setProjectOfflineAutoRefresh(
  projectId: string,
  enabled: boolean
) {
  await saveAppSetting(
    `${PROJECT_OFFLINE_AUTO_REFRESH_KEY_PREFIX}${projectId}`,
    enabled
  );
}
