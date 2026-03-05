import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhxOBatW40tfzP2nZVhSjJI55NeY4Nf_o",
  authDomain: "popo-da43c.firebaseapp.com",
  projectId: "popo-da43c",
  storageBucket: "popo-da43c.firebasestorage.app",
  messagingSenderId: "570136899084",
  appId: "1:570136899084:web:2a86be16b0ff2261c98829"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);