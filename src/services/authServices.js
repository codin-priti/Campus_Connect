import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

export const registerUser = async (
  fullName,
  phone,
  email,
  password,
  studentClass
) => {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  // update firebase auth display name
  await updateProfile(user, {
    displayName: fullName,
  });

  // create user document
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    phone,
    studentClass,
    photoURL: "",
    isOnline: false,
    isTyping: false,
    lastSeen: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return user;
};

export const loginUser = async (
  email,
  password
) => {
  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};