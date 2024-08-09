import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "pet-lover-app-4fad0.firebaseapp.com",
    projectId: "pet-lover-app-4fad0",
    storageBucket: "pet-lover-app-4fad0.appspot.com",
    messagingSenderId: "986972263302",
    appId: "1:986972263302:web:ac2a874a4729e488925207"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);