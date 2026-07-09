import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import chatService from "../services/chatService";

const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";
const BORDER = "rgba(92,225,198,0.16)";
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const setUserOnline = async (
  uid,
  online
) => {
  await setDoc(
    doc(db, "users", uid),
    {
      isOnline: online,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
};
function TypingIndicator({ otherUser }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const bounce = (anim, delay) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -5, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );

  useEffect(() => {
    bounce(dot1, 0).start();
    bounce(dot2, 200).start();
    bounce(dot3, 400).start();
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.msgAvatar}>
        <Text style={styles.msgAvatarText}>
          {otherUser?.name
            ?.substring(0, 2)
            .toUpperCase() || "U"}
        </Text>
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: anim }] }]}
          />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────
function MessageBubble({ item }) {
  return (
    <View style={[styles.msgRow, item.fromMe && styles.msgRowMe]}>
   
      <View style={{ maxWidth: "68%" }}>
        <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMe]}>
            {item.text}
          </Text>
        </View>
        <View style={[styles.bubbleMeta, item.fromMe && { alignSelf: "flex-end" }]}>
          <Text style={styles.bubbleTime}>{item.time}</Text>
          {item.fromMe && (
            <Text style={styles.checkMark}>
              {item.status === "read" ? "✓✓" : "✓"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Chat Screen
// ─────────────────────────────────────────────────────────────
export default function ChatScreen({ navigation, route }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [loading, setLoading] = useState(true);
  const [otherUserOnline, setOtherUserOnline] =
    useState(false);

  const [otherUserTyping, setOtherUserTyping] =
    useState(false);
  const flatListRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Initialize currentUser from Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  // Get otherUser from navigation route params
  useEffect(() => {
    if (route?.params?.otherUser) {
      setOtherUser(route.params.otherUser);
    }
  }, [route?.params?.otherUser]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!currentUser || !otherUser) {
        console.warn("CurrentUser or OtherUser not available");
        return;
      }
      try {
        console.log("Current User:", currentUser);
        console.log("Other User:", otherUser);
        const id = await chatService.createChatRoom(
          currentUser,
          otherUser
        );
        setChatId(id);
      } catch (error) {
        console.error("Error creating chat room:", error);
      }
    }
    initChat();
  }, [currentUser, otherUser]);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.subscribeToMessages(chatId, (firebaseMessages) => {
      setMessages(firebaseMessages)
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]); useEffect(() => {
    if (!otherUser?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", otherUser.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setOtherUser(prev => ({
            ...prev,
            uid: snapshot.id,
            ...data,
          }));

          setOtherUserOnline(
            data.isOnline || false
          );

          setOtherUserTyping(
            data.isTyping || false
          );
        }
      }
    );

    return unsubscribe;
  }, [otherUser?.uid]);

  useEffect(() => {
    if (!currentUser) return;

    const markPresence = async () => {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          isOnline: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
    };

    markPresence();

    return () => {
      const markOffline = async () => {
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            isOnline: false,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      };

      markOffline();
    };
  }, [currentUser]);

  const handleTyping = async (text) => {
    setInputText(text);

    if (!currentUser) return;

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        isTyping: text.length > 0,
      },
      { merge: true }
    );
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentUser)
      return;

    try {
      await chatService.sendMessage(
  chatId,
  currentUser.uid,
  otherUser.uid,
  inputText,
  currentUser.displayName ||
    currentUser.email
);

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          isTyping: false,
        },
        { merge: true }
      );

      setInputText("");
    } catch (error) {
      console.log(error);
    }
  };

  const renderItem = ({ item }) => {
    const formattedMessage = {
      ...item,
      fromMe:
        currentUser && item.senderId === currentUser.uid,
      time: item.timestamp
        ? item.timestamp
          .toDate()
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    };

    return (
      <MessageBubble
        item={formattedMessage}
      />
    );
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Grid lines */}
      <View style={styles.gridOverlay}>
        {[...Array(9)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: (height / 9) * i }]} />
        ))}
      </View>

      {/* Glow blobs */}
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.headerCenter}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("RecentChats")}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {otherUser?.name
                ?.substring(0, 2)
                .toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.headerName}>
              {otherUser?.name}
            </Text>

            <View style={styles.onlineRow}>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor:
                      otherUserOnline
                        ? "#00E676"
                        : "#777",
                  },
                ]}
              />              <Text style={styles.onlineText}>
                {otherUserOnline
                  ? "Online"
                  : otherUser?.lastSeen
                    ? `Last seen ${new Date(
                      otherUser.lastSeen.seconds * 1000
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                    : "Offline"}
              </Text>
            </View>
          </View>
        </View>
        {/* ── Messages ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({
                animated: true,
              })
            }
            ListFooterComponent={
              otherUserTyping ? (
                <TypingIndicator
                  otherUser={otherUser}
                />
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  No messages yet
                </Text>
              ) : null
            }
          />



          {/* ── Input Bar ── */}
          <View style={styles.inputBar}>
            {/* <TouchableOpacity style={styles.attachBtn}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity> */}

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message…"
                placeholderTextColor="rgba(255,255,255,0.28)"
                value={inputText}
                onChangeText={handleTyping} onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline
              />
              {/* <TouchableOpacity>
                <Text style={styles.emojiBtn}>☺</Text>
              </TouchableOpacity> */}
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    flex: 1,
  },

  // ===== HEADER =====
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 18,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    marginRight: 15,
  },

  backIcon: {
    color: PRIMARY,
    fontSize: 26,
    fontWeight: "700",
  },

  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(92,225,198,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerAvatarText: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "700",
  },

  headerName: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  onlineText: {
    color: "#9AB0C5",
    fontSize: 12,
  },

  // ===== MESSAGE LIST =====
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 25,
  },

  // ===== MESSAGE ROW =====
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  msgRowMe: {
    flexDirection: "row-reverse",
  },

  msgAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(92,225,198,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },

  msgAvatarText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
  },

  // ===== MESSAGE BUBBLES =====
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: width * 0.72,
  },

  bubbleThem: {
    backgroundColor: CARD,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },

  bubbleMe: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 5,
  },

  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#FFF",
  },

  bubbleTextMe: {
    color: BG,
    fontWeight: "500",
  },

  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  bubbleTime: {
    fontSize: 11,
    color: "#8FA1B5",
  },

  checkMark: {
    marginLeft: 5,
    color: "#8FA1B5",
    fontSize: 11,
  },

  // ===== TYPING =====
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  typingBubble: {
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginHorizontal: 2,
  },

  // ===== INPUT BAR =====
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  attachBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  attachIcon: {
    fontSize: 18,
  },

  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12233A",
    borderRadius: 28,
    paddingHorizontal: 16,
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER,
  },

  textInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    paddingVertical: 12,
    maxHeight: 120,
  },

  emojiBtn: {
    fontSize: 22,
    marginLeft: 8,
  },

  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 6,
  },

  sendIcon: {
    color: BG,
    fontSize: 20,
    fontWeight: "700",
  },
});