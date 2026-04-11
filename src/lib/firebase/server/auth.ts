import "server-only";

import { getAdminAuth } from "@/lib/firebase/server/admin";

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

export async function getAuthenticatedUserIdFromRequest(
  request: Request
): Promise<string | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.error("Failed to verify Firebase ID token:", error);
    return null;
  }
}
