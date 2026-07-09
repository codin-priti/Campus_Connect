import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

// Create a new lost item
export const createLostItem = async (
  lostData
) => {
  try {
    const currentUser =
      auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "User not logged in"
      );
    }

    const data = {
      ...lostData,

      // Owner Details
      userId: currentUser.uid,
      userName:
        currentUser.displayName ||
        currentUser.email ||
        "Unknown User",

      // Report Details
      type: "lost",
      status: "pending",
      createdAt: serverTimestamp(),
    };

    // Remove found-specific fields
    if (data.foundDate) {
      delete data.foundDate;
    }

    console.log(
      "Creating lost report:",
      data
    );

    const docRef = await addDoc(
      collection(db, "lostReports"),
      data
    );

    return docRef.id;
  } catch (error) {
    console.error(
      "Error creating lost item:",
      error
    );
    throw error;
  }
};

// Get all lost items
export const getLostItems = async () => {
  try {
    const querySnapshot =
      await getDocs(
        collection(db, "lostReports")
      );

    return querySnapshot.docs.map(
      (item) => ({
        id: item.id,
        ...item.data(),
      })
    );
  } catch (error) {
    console.error(
      "Error fetching lost items:",
      error
    );
    throw error;
  }
};

// Get single lost report
export const getLostReportById =
  async (reportId) => {
    try {
      const docRef = doc(
        db,
        "lostReports",
        reportId
      );

      const docSnap =
        await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } catch (error) {
      console.error(
        "Error fetching lost report:",
        error
      );
      throw error;
    }
  };

// Mark report as found
export const markAsFound = async (
  reportId
) => {
  try {
    const docRef = doc(
      db,
      "lostReports",
      reportId
    );

    await updateDoc(docRef, {
      status: "found",
      foundAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(
      "Error marking item as found:",
      error
    );
    throw error;
  }
};

// Get reports created by user
export const getUserLostReports =
  async (userId) => {
    try {
      const q = query(
        collection(db, "lostReports"),
        where("userId", "==", userId)
      );

      const querySnapshot =
        await getDocs(q);

      return querySnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );
    } catch (error) {
      console.error(
        "Error fetching user reports:",
        error
      );
      throw error;
    }
  };

// Delete report
export const deleteLostReport =
  async (reportId) => {
    try {
      await deleteDoc(
        doc(
          db,
          "lostReports",
          reportId
        )
      );
    } catch (error) {
      console.error(
        "Error deleting report:",
        error
      );
      throw error;
    }
  };