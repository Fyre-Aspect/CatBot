import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSRcCKLteQMAe9no72GCDReFHWo1xSUQk",
  authDomain: "catbot-d830b.firebaseapp.com",
  projectId: "catbot-d830b",
  storageBucket: "catbot-d830b.firebasestorage.app",
  messagingSenderId: "551252599022",
  appId: "1:551252599022:web:aa7ef7b1d25eb4af7713ff",
  measurementId: "G-EQ0WC5WH12"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;