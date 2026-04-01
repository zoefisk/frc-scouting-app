"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { signInWithGoogle, signOutUser } from "@/lib/firebase/auth";
import {createUserProfileIfMissing} from "@/lib/firebase/users/createUserProfileMissing";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            setUser(nextUser);

            if (nextUser) {
                try {
                    await createUserProfileIfMissing(nextUser);
                } catch (err) {
                    console.error("Failed to create user profile:", err);
                }
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = React.useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            signIn: async () => {
                await signInWithGoogle();
            },
            signOut: async () => {
                await signOutUser();
            },
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}
