export function enforceOffline(effectiveOnline: boolean) {
  if (!effectiveOnline) {
    throw new Error("Attempted network call while in forced offline mode.");
  }
}
