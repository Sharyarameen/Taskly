import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- IMPORTANT ---
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// This file is in .gitignore, so your keys will NOT be uploaded to GitHub.
//
// To get your config:
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. Click the gear icon (Project settings).
// 3. Under "Your apps", find your web app.
// 4. In "SDK setup and configuration", choose "Config".
// 5. Copy the 'firebaseConfig' object and paste it below.

const firebaseConfig = {
  apiKey: "AIzaSyCvzw0PIlIMG5pvuysGCssCXkoxjEJJMss",
  authDomain: "taskly-3cfb8.firebaseapp.com",
  projectId: "taskly-3cfb8",
  storageBucket: "taskly-3cfb8.firebasestorage.app",
  messagingSenderId: "379091476907",
  appId: "1:379091476907:web:9ea03f6d6ca3ddc659b2ee"
};

// This check helps the app show a friendly error if the config is not filled out.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE" && firebaseConfig.projectId !== "PASTE_YOUR_PROJECT_ID_HERE";

// Initialize Firebase
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize services only if Firebase is configured
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

if (!isFirebaseConfigured) {
    console.warn("FIREBASE IS NOT CONFIGURED. Please update firebaseConfig.ts with your project credentials.");
}
