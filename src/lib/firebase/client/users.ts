import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client/app";
import type { AppUserProfile } from "@/lib/firebase/shared/types";

export async function createUserProfileIfMissing(user: User) {
    const ref = doc(db, "users", user.uid);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) return;

    await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        role: "scout",
        active: true,
        createdAt: serverTimestamp(),
    });
}

export async function getUserProfile(uid: string): Promise<AppUserProfile | null> {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;
    return snapshot.data() as AppUserProfile;
}
