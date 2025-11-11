import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- IMPORTANT ---
// This is a placeholder Firebase configuration.
// You MUST replace it with your own project's configuration details for the app to work.
//
// To get your config:
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. In the top left, click the gear icon to go to "Project settings".
// 3. In the "Your apps" card, select your web app (or create one if you haven't).
// 4. Under "SDK setup and configuration", select the "Config" option.
// 5. Copy the entire 'firebaseConfig' object and paste it below, replacing the placeholder.

const firebaseConfig = {
  apiKey: "AIzaSyCvzw0PIlIMG5pvuysGCssCXkoxjEJJMss",
  authDomain: "taskly-3cfb8.firebaseapp.com",
  projectId: "taskly-3cfb8",
  storageBucket: "taskly-3cfb8.firebasestorage.app",
  messagingSenderId: "379091476907",
  appId: "1:379091476907:web:9ea03f6d6ca3ddc659b2ee"
};

// This check prevents the app from running with placeholder credentials.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY" && firebaseConfig.projectId !== "REPLACE_WITH_YOUR_PROJECT_ID";


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);