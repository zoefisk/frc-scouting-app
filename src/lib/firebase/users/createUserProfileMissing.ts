import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { User } from "firebase/auth";

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
