import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Build firebase config strictly from env vars (no hard‑coded fallbacks to avoid leaking keys).
function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.warn(`[firebase] Missing required env var: ${name}`); // non-fatal so app can still render an error screen
  }
  return v || '';
}

const firebaseConfig = {
  apiKey: required('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: required('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup };
