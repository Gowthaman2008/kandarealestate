import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8DbslH9lpQxWPfifbh-Hz-TD0aD2jhf0",
  authDomain: "kandarealestate.firebaseapp.com",
  projectId: "kandarealestate",
  storageBucket: "kandarealestate.firebasestorage.app",
  messagingSenderId: "1075562874943",
  appId: "1:1075562874943:web:89cc88938fcce2acd2508a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const config = firebaseConfig;
