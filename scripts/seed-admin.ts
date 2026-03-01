// This is a utility script/tool to seed the first admin.
// It is not exposed via public API. Run this manually or via a secure admin shell if needed.
// For the purpose of this PR, we assume the developer can manually update Firestore or use this function locally.

import { db } from "@/lib/firebase-server";

export const promoteUserToAdmin = async (userId: string) => {
    try {
        const userRef = db.collection("users").doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) return false;

        const currentRoles = doc.data()?.roles || [];
        if (!currentRoles.includes('admin')) {
            await userRef.update({
                roles: [...currentRoles, 'admin']
            });
            console.log(`User ${userId} promoted to admin.`);
        }
        return true;
    } catch (error) {
        console.error("Failed to promote admin:", error);
        return false;
    }
};
