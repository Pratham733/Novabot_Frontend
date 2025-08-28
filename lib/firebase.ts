import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Prefer EXPO_PUBLIC_* env vars; fall back to the provided config for convenience in dev.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDCH6aWsVl6_5S-w5AovBbUGRQKWe8LH4g',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'novabot-7ao7b.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'novabot-7ao7b',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'novabot-7ao7b.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '793201613927',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:793201613927:web:112b9aff1265f0233188c2',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup };
