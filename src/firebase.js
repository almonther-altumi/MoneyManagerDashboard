// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLieqrNSZhDqfzZCUn8uBHASFhLY20W0M",
  authDomain: "moneymangament.firebaseapp.com",
  projectId: "moneymangament",
  storageBucket: "moneymangament.firebasestorage.app",
  messagingSenderId: "721441962023",
  appId: "1:721441962023:web:9b32a6f65ad807e5aa3602",
  measurementId: "G-Y0ZQ6ZYS6V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
