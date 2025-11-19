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
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const firestore = getFirestore(app);