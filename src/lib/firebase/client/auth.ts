import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
    return signOut(auth);
}
