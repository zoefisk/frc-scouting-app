import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client/app";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

function logFirebaseAuthError(error: unknown) {
  const err = error as Partial<AuthError> & {
    customData?: Record<string, unknown>;
  };

  console.group("Firebase Google sign-in error");
  console.error("full error:", error);
  console.log("code:", err.code);
  console.log("message:", err.message);
  console.log("name:", err.name);
  console.log("customData:", err.customData);
  console.log("email:", err.customData?.email);
  console.log("tenantId:", err.customData?.tenantId);
  console.log(
    "operationType:",
    (err as { operationType?: string }).operationType
  );
  console.log("providerId:", (err as { providerId?: string }).providerId);
  console.log(
    "current origin:",
    typeof window !== "undefined" ? window.location.origin : null
  );
  console.log("firebase projectId:", auth.app.options.projectId);
  console.log("firebase authDomain:", auth.app.options.authDomain);
  console.groupEnd();
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    console.group("Firebase Google sign-in success");
    console.log("uid:", result.user.uid);
    console.log("email:", result.user.email);
    console.log("displayName:", result.user.displayName);
    console.log(
      "current origin:",
      typeof window !== "undefined" ? window.location.origin : null
    );
    console.log("firebase projectId:", auth.app.options.projectId);
    console.log("firebase authDomain:", auth.app.options.authDomain);
    console.groupEnd();

    return result;
  } catch (error) {
    logFirebaseAuthError(error);

    const err = error as Partial<AuthError>;

    if (err.code === "auth/popup-closed-by-user") {
      console.warn("Google sign-in popup was closed before completion.");
      return null;
    }

    if (err.code === "auth/popup-blocked") {
      console.warn("Google sign-in popup was blocked by the browser.");
      return null;
    }

    if (err.code === "auth/unauthorized-domain") {
      console.error(
        "Unauthorized domain for Firebase Auth OAuth. Check that the CURRENT origin matches an Authorized Domain in the SAME Firebase project shown above."
      );
    }

    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase sign-out error:", error);
    throw error;
  }
}

export async function getCurrentUserIdToken(): Promise<string | null> {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken();
}
