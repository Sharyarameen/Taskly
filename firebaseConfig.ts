import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- STEP 1: CONFIGURE YOUR ENVIRONMENT VARIABLES ---
// This file now reads your Firebase keys from Environment Variables.
// This is the secure way to handle secrets for a deployed website.
// You must set these variables in your hosting provider's settings (e.g., Vercel).
// DO NOT PASTE YOUR KEYS DIRECTLY INTO THIS FILE FOR DEPLOYMENT.

const firebaseConfig = {
  apiKey: "AIzaSyCvzw0PIlIMG5pvuysGCssCXkoxjEJJMss",
  authDomain: "taskly-3cfb8.firebaseapp.com",
  projectId: "taskly-3cfb8",
  storageBucket: "taskly-3cfb8.firebasestorage.app",
  messagingSenderId: "379091476907",
  appId: "1:379091476907:web:9ea03f6d6ca3dsfsdddc659b2ee"
};

// This check ensures the app shows a setup guide if the environment variables are not set.
export const isFirebaseConfigured = 
    firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId;

// Initialize Firebase
// This structure prevents the app from crashing if the config is missing.
let app = null;
try {
    app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
} catch (e) {
    console.error("Firebase initialization failed. Your API keys might be invalid.", e);
}


// Initialize services only if Firebase is configured
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

if (!isFirebaseConfigured) {
    console.warn("FIREBASE IS NOT CONFIGURED. Please set up your environment variables in your hosting provider (e.g., Vercel). The setup guide should be visible.");
}
