// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

// Khởi tạo các dịch vụ
const app = initializeApp(firebaseConfig);

// Xuất bản (export) ra ngoài để file App.jsx có thể gọi sử dụng
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'gym-app-tracking';
