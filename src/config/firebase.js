import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyACSU8gYG9nMNrtcQrNs5yAWx84t310cak",
  authDomain: "lost-found-app-8da4a.firebaseapp.com",
  projectId: "lost-found-app-8da4a",
  storageBucket: "lost-found-app-8da4a.firebasestorage.app",
  messagingSenderId: "848032142259",
  appId: "1:848032142259:web:740cc4f020d08a3f7db1c6",
  measurementId: "G-VXGTPDWM61",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);