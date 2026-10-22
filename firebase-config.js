// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// প্রয়োজন অনুযায়ী অন্যান্য সার্ভিস যেমন Auth, Firestore ইত্যাদি ইম্পোর্ট করতে পারেন
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// Firebase Console থেকে পাওয়া আপনার নিজস্ব কনফিগারেশন এখানে বসাবেন
const firebaseConfig = {
  apiKey: "AIzaSyBO5kX33bqdEi_lt66S4dpt3ba8cgKnOWA",
  authDomain: "shopsbd.firebaseapp.com",
  projectId: "shopsbd",
  storageBucket: "shopsbd.firebasestorage.app",
  messagingSenderId: "668753126238",
  appId: "1:668753126238:web:cf71ad6d5e3dcc5ba3a5cf",
  measurementId: "G-KQNQESJ104"
};

// Firebase App ইনিশিয়ালাইজ বা চালু করা
const app = initializeApp(firebaseConfig);

// অন্য ফাইলে ব্যবহার করার জন্য এক্সপোর্ট করে দিন
export default app;

// উদাহরণস্বরূপ Auth বা Firestore ব্যবহার করতে চাইলে:
// export const auth = getAuth(app);
// export const db = getFirestore(app);
const app = initializeApp(firebaseConfig);
