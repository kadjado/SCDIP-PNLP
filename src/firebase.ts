
import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDO9bKH4vRi6f-5UET1WoBK26lG7Lqj2-s",
  authDomain: "scdip-6b090.firebaseapp.com",
  projectId: "scdip-6b090",
  storageBucket: "scdip-6b090.firebasestorage.app",
  messagingSenderId: "386131566761",
  appId: "1:386131566761:web:4077ed09f0f8a2e10509b8",
  measurementId: "G-W8XGPX86C9"
};

const app = initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  return getMessaging(app);
}

export { app };
