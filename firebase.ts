import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
export const analytics = getAnalytics(app);