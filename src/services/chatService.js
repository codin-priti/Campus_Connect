import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";

// Create Chat Room
export const createChatRoom = async (currUser, otherUser) => {
  const chatId = [currUser.uid, otherUser.uid]
    .sort()
    .join("_");

  const chatRef = doc(db, "chats", chatId);

  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [
        currUser.uid,
        otherUser.uid,
      ],

      participantDetails: {
        [currUser.uid]: {
name:
  currUser.displayName ||
  currUser.email ||
  "Unknown User",          photo: currUser.photoURL || "",
        },
        [otherUser.uid]: {
name:
  otherUser.name ||
  otherUser.email ||
  "Unknown User",          photo: otherUser.photoURL || "",
        },
      },
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTimestamp: null,
    });
  }

  return chatId;
};

// Send Message
export const sendMessage = async (
  chatId,
  senderId,
  receiverId,
  text,
  senderName
) => {
  if (!text.trim()) return;

  await addDoc(
    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),
    {
      senderId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      status: "sent",
    }
  );

  await updateDoc(
    doc(db, "chats", chatId),
    {
      lastMessage: text.trim(),
      lastMessageTimestamp:
        serverTimestamp(),
    }
  );

  // Get receiver's push token
  const receiverDoc = await getDoc(
    doc(db, "users", receiverId)
  );

  if (
    receiverDoc.exists() &&
    receiverDoc.data().expoPushToken
  ) {
    const token =
      receiverDoc.data().expoPushToken;

    await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          to: token,
          sound: "default",
          title: senderName,
          body: text.trim(),
          data: {
            chatId,
            senderId,
          },
        }),
      }
    );
  }
};
// Listen for Messages
export const subscribeToMessages = (
  chatId,
  callback
) => {
  const q = query(
    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    callback(messages);
  },    (error) => {
      console.log(
        "Chat Listener Error:",
        error
      );
    } );
};

export const subscribeToChats = (
  userId,
  callback
) => {
  const q = query(
    collection(db, "chats"),
    where(
      "participants",
      "array-contains",
      userId
    )
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const aTime = a.lastMessageTimestamp?.toMillis?.() || 0;
        const bTime = b.lastMessageTimestamp?.toMillis?.() || 0;
        return bTime - aTime;
      });

    callback(chats);
  }, (error) => {
    console.log("Chat Listener Error:", error);
  });
};

const chatService = {
  createChatRoom,
  sendMessage,
  subscribeToMessages,
  subscribeToChats,
};

export default chatService;

