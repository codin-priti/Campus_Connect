import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const getPossibleMatches = async (lostItem) => {
  try {
    const snapshot = await getDocs(
      collection(db, "posts")
    );

    const matches = [];

    snapshot.forEach((doc) => {
      const post = {
        id: doc.id,
        ...doc.data(),
      };

      let score = 0;

      // Safe values
      const lostTitle = (
        lostItem?.title || ""
      ).toLowerCase();

      const postTitle = (
        post?.title || ""
      ).toLowerCase();

      const lostLocation = (
        lostItem?.location || ""
      ).toLowerCase();

      const postLocation = (
        post?.location || ""
      ).toLowerCase();

      const lostCategory = (
        lostItem?.category || ""
      ).toLowerCase();

      const postCategory = (
        post?.category || ""
      ).toLowerCase();

      const lostDescription = (
        lostItem?.description || ""
      ).toLowerCase();

      const postDescription = (
        post?.description || ""
      ).toLowerCase();

      // Title Match
      if (
        lostTitle &&
        postTitle &&
        lostTitle === postTitle
      ) {
        score += 40;
      }

      // Location Match
      if (
        lostLocation &&
        postLocation &&
        lostLocation === postLocation
      ) {
        score += 30;
      }

      // Category Match
      if (
        lostCategory &&
        postCategory &&
        lostCategory === postCategory
      ) {
        score += 20;
      }

      // Description Keyword Match
      const lostWords = lostDescription
        .split(" ")
        .filter(
          (word) =>
            word.trim() !== "" &&
            word.length > 2
        );

      const postWords = postDescription
        .split(" ")
        .filter(
          (word) =>
            word.trim() !== "" &&
            word.length > 2
        );

      const commonWords = lostWords.filter(
        (word) => postWords.includes(word)
      );

      score += commonWords.length * 5;

      // Date Match
      if (
        lostItem?.lostDate &&
        post?.foundDate
      ) {
        try {
          const lostDate = new Date(
            lostItem.lostDate
          );

          const foundDate = new Date(
            post.foundDate
          );

          const diffDays =
            Math.abs(foundDate - lostDate) /
            (1000 * 60 * 60 * 24);

          if (diffDays <= 7) {
            score += 20;
          }
        } catch (error) {
          console.log(
            "Date comparison error:",
            error
          );
        }
      }

      // Add match if score is enough
      if (score >= 20) {
        matches.push({
          ...post,
          matchScore: score,
        });
      }
    });

    // Highest score first
    matches.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    if (matches.length === 0) {
      console.log("No matching items found");
    } else {
      console.log(
        "Matched Results:",
        matches
      );
    }

    return matches;
  } catch (error) {
    console.error(
      "Error fetching possible matches:",
      error
    );

    return [];
  }
};


export const getLostMatchesForFoundItem = async (
  foundItem
) => {
  try {
    const snapshot = await getDocs(
      collection(db, "lostReports")
    );

    const matches = [];

    snapshot.forEach((doc) => {
      const lostPost = {
        id: doc.id,
        ...doc.data(),
      };

      let score = 0;

      const foundTitle = (
        foundItem?.title || ""
      ).toLowerCase();

      const lostTitle = (
        lostPost?.title || ""
      ).toLowerCase();

      const foundLocation = (
        foundItem?.location || ""
      ).toLowerCase();

      const lostLocation = (
        lostPost?.location || ""
      ).toLowerCase();

      const foundCategory = (
        foundItem?.category || ""
      ).toLowerCase();

      const lostCategory = (
        lostPost?.category || ""
      ).toLowerCase();

      const foundDescription = (
        foundItem?.description || ""
      ).toLowerCase();

      const lostDescription = (
        lostPost?.description || ""
      ).toLowerCase();

      // Title Match
      if (
        foundTitle &&
        lostTitle &&
        foundTitle === lostTitle
      ) {
        score += 40;
      }

      // Location Match
      if (
        foundLocation &&
        lostLocation &&
        foundLocation === lostLocation
      ) {
        score += 30;
      }

      // Category Match
      if (
        foundCategory &&
        lostCategory &&
        foundCategory === lostCategory
      ) {
        score += 20;
      }

      // Description Match
      const foundWords = foundDescription
        .split(" ")
        .filter(
          (word) =>
            word.trim() !== "" &&
            word.length > 2
        );

      const lostWords = lostDescription
        .split(" ")
        .filter(
          (word) =>
            word.trim() !== "" &&
            word.length > 2
        );

      const commonWords = foundWords.filter(
        (word) => lostWords.includes(word)
      );

      score += commonWords.length * 5;

      // Date Match
      if (
        foundItem?.foundDate &&
        lostPost?.lostDate
      ) {
        try {
          const foundDate = new Date(
            foundItem.foundDate
          );

          const lostDate = new Date(
            lostPost.lostDate
          );

          const diffDays =
            Math.abs(foundDate - lostDate) /
            (1000 * 60 * 60 * 24);

          if (diffDays <= 7) {
            score += 20;
          }
        } catch (error) {
          console.log(
            "Date comparison error:",
            error
          );
        }
      }

      if (score >= 20) {
        matches.push({
          ...lostPost,
          matchScore: score,
        });
      }
    });

    matches.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    return matches;
  } catch (error) {
    console.error(
      "Error fetching lost matches:",
      error
    );

    return [];
  }
};