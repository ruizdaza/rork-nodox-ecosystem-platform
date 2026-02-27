import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-client";

// Define the User type that matches your application's needs
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  membershipType: "free" | "premium";
  joinDate: string;
  isAlly: boolean;
  allyStatus?: "none" | "pending" | "temp_approved" | "approved" | "rejected";
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              ...userData,
              id: firebaseUser.uid,
              email: firebaseUser.email || userData.email,
            });
          } else {
            // If user doc doesn't exist, create a basic one (or handle as error)
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
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          setError(err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
