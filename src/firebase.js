import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMbUO9yeB4B1IIQbdRQrO6v0KPgQwLgto",
  authDomain: "itd112-998c2.firebaseapp.com",
  projectId: "itd112-998c2",
  storageBucket: "itd112-998c2.appspot.com",
  messagingSenderId: "863229734599",
  appId: "1:863229734599:web:e4a0246264b1eee976d8e2",
  measurementId: "G-YCF20CRFHE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };
