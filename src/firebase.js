import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// La tua configurazione Firebase (leggi dal file .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db;
let messaging;

try {
  // Inizializza Firebase solo se la configurazione è presente
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase config is missing. Database operations will fail. Please set up .env.local");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, db, messaging };
