import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from "react-native";

import { auth } from "../config/firebase";
import chatService from "../services/chatService";

const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";
const BORDER = "rgba(92,225,198,0.16)";

export default function RecentChatsScreen({
  navigation,
}) {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe =
      chatService.subscribeToChats(
        auth.currentUser.uid,
        setChats
      );

    return unsubscribe;
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate();

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const otherUserId =
        chat.participants?.find(
          (id) =>
            id !== auth.currentUser?.uid
        );

      const otherUser =
        chat.participantDetails?.[
          otherUserId
        ];

      const name =
        otherUser?.name?.toLowerCase() ||
        "";

      const message =
        chat.lastMessage?.toLowerCase() ||
        "";

      const query =
        search.toLowerCase();

      return (
        name.includes(query) ||
        message.includes(query)
      );
    });
  }, [chats, search]);

  const renderChat = ({ item }) => {
    const otherUserId =
      item.participants?.find(
        (id) =>
          id !== auth.currentUser?.uid
      );

    const otherUser =
      item.participantDetails?.[
        otherUserId
      ];

    const initials =
      otherUser?.name
        ?.split(" ")
        ?.map((word) => word[0])
        ?.join("")
        ?.substring(0, 2)
        ?.toUpperCase() || "U";

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.85}
        onPress={() =>
  navigation.navigate("Chat", {
    chatId: item.id,
    otherUser: {
      uid: otherUserId,
      name:
        otherUser?.name ||
        "Unknown User",
      email:
        otherUser?.email || "",
      photoURL:
        otherUser?.photo || "",
    },
  })
}
      >
        <View style={styles.avatar}>
          <Text
            style={styles.avatarText}
          >
            {initials}
          </Text>
        </View>

        <View style={styles.chatContent}>
          <View style={styles.topRow}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {otherUser?.name ||
                "Unknown User"}
            </Text>

            <Text style={styles.time}>
              {formatTime(
                item.lastMessageTimestamp
              )}
            </Text>
          </View>

          <Text
            style={styles.message}
            numberOfLines={1}
          >
            {item.lastMessage ||
              "Start chatting"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        No Conversations Yet
      </Text>

      <Text style={styles.emptyText}>
        When you contact someone
        about a lost or found item,
        your conversations will
        appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BG}
      />

      <Text style={styles.heading}>
        Messages
      </Text>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
          placeholderTextColor="#7B8A9B"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          renderEmpty
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 30,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  searchBox: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  searchInput: {
    height: 52,
    color: "#FFFFFF",
    fontSize: 15,
  },

  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      "rgba(92,225,198,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "700",
  },

  chatContent: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  time: {
    color: "#8FA1B5",
    fontSize: 12,
  },

  message: {
    marginTop: 6,
    color: "#A9B5C3",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  emptyText: {
    color: "#8FA1B5",
    textAlign: "center",
    lineHeight: 22,
  },
});