import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";

import { db, auth } from "../config/firebase";

// Create a new post
export const createPost = async (postData) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not logged in");
    }

    const data = {
      ...postData,

      // Owner Details
      ownerId: currentUser.uid,
      ownerName:
        currentUser.displayName ||
        currentUser.email ||
        "Unknown User",
      ownerEmail: currentUser.email,

      // Post Details
      type: "found",
      status: "active",
      createdAt: Timestamp.now(),
    };

    // Remove lost-specific fields
    if (data.lostDate) {
      delete data.lostDate;
    }

    console.log("Creating post with payload:", data);

    const docRef = await addDoc(
      collection(db, "posts"),
      data
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Get all posts
export const getPosts = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "posts")
    );

    return querySnapshot.docs.map((post) => ({
      id: post.id,
      ...post.data(),
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Get single post by ID
export const getPostById = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
};

// Get posts created by a user
export const getUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, "posts"),
      where("ownerId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((post) => ({
      id: post.id,
      ...post.data(),
    }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

// Update post
export const updatePost = async (
  postId,
  updatedData
) => {
  try {
    const docRef = doc(db, "posts", postId);

    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

// Archive post
export const archivePost = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);

    await updateDoc(docRef, {
      status: "archived",
      archivedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error archiving post:", error);
    throw error;
  }
};

// Delete post
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const resolvePost = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);

    await updateDoc(docRef, {
      status: "resolved",
      resolvedAt: Timestamp.now(),
    });
  } catch (error) {
    console.log("Error resolving post:", error);
    throw error;
  }
};