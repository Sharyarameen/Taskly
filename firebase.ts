import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnRHpEvunnmfKsPtTU3cBhyqdoeYkucKg",
  authDomain: "taskly-b842b.web.app",
  projectId: "taskly-b842b",
  storageBucket: "taskly-b842b.appspot.com",
  messagingSenderId: "885809221273",
  appId: "1:885809221273:web:cb82b4a37d668de76eb208",
  measurementId: "G-Z5RR6HK213"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// FIX: The 'getAnalytics' function is only available in browser environments and is causing a build error.
// Analytics is disabled to resolve the issue. The build configuration may need to be updated to correctly
// resolve browser-specific modules.
export const analytics = null;
