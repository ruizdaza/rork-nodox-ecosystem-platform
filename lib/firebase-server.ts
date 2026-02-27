import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines for private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // Fallback for dev without creds - will fail real ops
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Running in dev mode without full admin creds');
    }
  }
}

const db = getFirestore();
const auth = getAuth();

export { admin, db, auth };
