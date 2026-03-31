import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type AppUserProfile = {
    uid: string;
    email: string;
    displayName: string;
    role: "scout" | "admin";
    active: boolean;
};

export async function getUserProfile(uid: string): Promise<AppUserProfile | null> {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;
    return snapshot.data() as AppUserProfile;
}
