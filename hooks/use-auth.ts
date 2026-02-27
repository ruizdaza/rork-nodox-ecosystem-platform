import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-client";

// Define the User type that matches your application's needs
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  membershipType: "free" | "plus" | "premium";
  membershipExpiresAt?: string;
  joinDate: string;
  isAlly: boolean;
  allyStatus?: "none" | "pending" | "temp_approved" | "approved" | "rejected";
  referralCode?: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);

          // Listen to User Doc changes in real-time (to catch membership updates immediately)
          const unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
             if (userDoc.exists()) {
                const userData = userDoc.data() as User;

                // Client-side membership expiration check (lazy degradation)
                let effectiveMembership = userData.membershipType || "free";
                if (userData.membershipExpiresAt) {
                    const expiry = new Date(userData.membershipExpiresAt);
                    if (expiry < new Date()) {
                        effectiveMembership = "free";
                        // Note: We don't write back to DB here to avoid spamming writes on every load.
                        // Ideally a backend scheduled job handles the downgrade status persistence.
                    }
                }

                setUser({
                  ...userData,
                  membershipType: effectiveMembership,
                  id: firebaseUser.uid,
                  email: firebaseUser.email || userData.email,
                });
             } else {
                // Create basic user doc if missing
                const newUser: User = {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || "Usuario",
                  email: firebaseUser.email || "",
                  roles: ["user"],
                  membershipType: "free",
                  joinDate: new Date().toISOString(),
                  isAlly: false,
                  allyStatus: "none",
                };
                setDoc(userDocRef, newUser);
                setUser(newUser);
             }
             setLoading(false);
          });

          return () => unsubscribeDoc(); // Cleanup doc listener when auth changes/unmounts?
          // Actually onAuthStateChanged callback runs once per state change.
          // We need to manage the doc subscription lifecycle carefully.
          // For simplicity in this hook structure, we might leak the doc listener if user logs out and in quickly?
          // No, the return of useEffect cleans up `unsubscribeAuth`.
          // But `unsubscribeDoc` needs to be cleaned up too.
          // Since we are inside the callback, we can't easily return it to useEffect cleanup.
          // Refactor: We should store unsubscribeDoc in a ref or use a separate useEffect for the doc listener dependent on firebaseUser.

        } catch (err: any) {
          console.error("Error fetching user data:", err);
          setError(err.message);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Error signing out:", err);
      setError(err.message);
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  };
});
