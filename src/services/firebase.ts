import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyDQLnPMPCIfYUkKYkENHZqE3SvjDyQGEyc",
  authDomain: "sacred-canopy-168ef.firebaseapp.com",
  projectId: "sacred-canopy-168ef",
  storageBucket: "sacred-canopy-168ef.firebasestorage.app",
  messagingSenderId: "251089020766",
  appId: "1:251089020766:web:80d9609481c7090bca91cf"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
