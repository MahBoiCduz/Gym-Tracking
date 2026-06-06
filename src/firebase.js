// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAz-CDKpOSsIPdiyjB8Ewt2R1obmTg1tuk",
  authDomain: "gym-app-tracking.firebaseapp.com",
  projectId: "gym-app-tracking",
  storageBucket: "gym-app-tracking.firebasestorage.app",
  messagingSenderId: "21201987935",
  appId: "1:21201987935:web:0fa3380fee5ec5beaa2eea",
  measurementId: "G-6X1SPJPK5E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Giữ phiên đăng nhập trong localStorage (ổn định hơn)
setPersistence(auth, browserLocalPersistence).catch((e) => console.warn('Persistence error:', e));

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const appId = 'gym-app-tracking';
