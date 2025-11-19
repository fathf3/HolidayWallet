import * as firebase from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw4JJsvupQCLPl2wCECuqD0xYdhcPW238",
  authDomain: "holidaywallet.firebaseapp.com",
  projectId: "holidaywallet",
  storageBucket: "holidaywallet.firebasestorage.app",
  messagingSenderId: "758562691404",
  appId: "1:758562691404:web:1d5cef1d1ef963152a97e9",
  measurementId: "G-L8X74763PM"
};

// Initialize Firebase
// Using 'any' cast and namespace import to resolve potential type definition mismatch
const app = (firebase as any).initializeApp 
    ? (firebase as any).initializeApp(firebaseConfig) 
    : (firebase as any).default?.initializeApp 
        ? (firebase as any).default.initializeApp(firebaseConfig) 
        : undefined;

export const firestore = app ? getFirestore(app) : {} as any;