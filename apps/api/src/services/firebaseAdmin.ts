import admin from 'firebase-admin';
import { env } from '../config/env';

let initialized = false;

export function getFirebaseAdmin(): admin.app.App | null {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }
  if (!initialized) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
    });
    initialized = true;
  }
  return admin.app();
}

export async function verifyFirebaseIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase Admin is not configured on the server.');
  }
  return admin.auth(app).verifyIdToken(idToken);
}
