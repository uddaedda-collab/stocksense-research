'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { FIREBASE_CONFIG, IS_FIREBASE_CONFIGURED } from './config';

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!IS_FIREBASE_CONFIGURED) return null;
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getAuth(firebaseApp) : null;
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.');
  await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.');
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}
