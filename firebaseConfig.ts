import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration.
// This has been updated with your new project details.
// For the app to work, please ensure your "Email/Password" sign-in provider is enabled in the Firebase Authentication console.
const firebaseConfig = {
  apiKey: "AIzaSyCvzw0PIlIMG5pvuysGCssCXkoxjEJJMss",
  authDomain: "taskly-3cfb8.firebaseapp.com",
  projectId: "taskly-3cfb8",
  storageBucket: "taskly-3cfb8.firebasestorage.app",
  messagingSenderId: "379091476907",
  appId: "1:379091476907:web:9ea03f6d6ca3ddc659b2ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);