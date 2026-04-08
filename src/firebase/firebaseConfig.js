import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXIWd7OiZISw6dBwjzg6khrWjdH6wgMD0",
  authDomain: "taskmanager-fd2dc.firebaseapp.com",
  projectId: "taskmanager-fd2dc",
  storageBucket: "taskmanager-fd2dc.firebasestorage.app",
  messagingSenderId: "162459704890",
  appId: "1:162459704890:web:c2408193ad0f60da7b1f03",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);