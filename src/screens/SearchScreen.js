// screens/SearchResultsScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../config/firebase";

const COLORS = {
  bg: "#03131A",
  card: "#0B1F2A",
  primary: "#64E7D6",
  secondary: "#FFB85C",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.08)",
};

export default function SearchResultsScreen({
  route,
  navigation,
}) {
  const { results = [], searchText = "" } =
    route.params || {};

const renderItem = ({ item }) => {
  console.log("==============");
  console.log("ITEM:", item);
  console.log("Current User UID:", auth.currentUser?.uid);
  console.log("Post User UID:", item.userId);
  console.log(
    "isMyPost:",
    item.userId === auth.currentUser?.uid
  );
  console.log("Type:", item.type);
  console.log("Owner Name:", item.ownerName);
  console.log("Contact Name:", item.contactName);
  console.log("==============");

  const isMyPost =
    item.userId === auth.currentUser?.uid;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                item.type === "found"
                  ? "rgba(100,231,214,0.15)"
                  : "rgba(255,184,92,0.15)",
            },
          ]}
        >
          <Text style={styles.icon}>
            {item.type === "found" ? "📦" : "❓"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {item.title}
          </Text>

          <Text style={styles.meta}>
            {item.location} • {item.category}
          </Text>

          <Text style={styles.description}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.type === "found"
                  ? "rgba(100,231,214,0.15)"
                  : "rgba(255,184,92,0.15)",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  item.type === "found"
                    ? COLORS.primary
                    : COLORS.secondary,
              },
            ]}
          >
            {item.type?.toUpperCase()}
          </Text>
        </View>

        {!isMyPost && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => {
              console.log("Chat button pressed");
              console.log("Navigating with:", {
                otherUser: {
                  uid:
                    item.userId ||
                    item.ownerId,
                  name:
                    item.ownerName ||
                    item.contactName ||
                    "User",
                  email:
                    item.ownerEmail || "",
                },
                postId: item.id,
                itemTitle: item.title,
              });

              navigation.navigate("Chat", {
                otherUser: {
                  uid:
                    item.userId ||
                    item.ownerId,
                  name:
                    item.ownerName ||
                    item.contactName ||
                    "User",
                  email:
                    item.ownerEmail || "",
                },
                postId: item.id,
                itemTitle: item.title,
              });
            }}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={18}
              color="#03131A"
            />
            <Text style={styles.chatText}>
              Chat with Owner
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.heading}>
          Search Results
        </Text>
      </View>

      <Text style={styles.subHeading}>
        Results for "{searchText}"
      </Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🔍
            </Text>

            <Text style={styles.emptyTitle}>
              No Items Found
            </Text>

            <Text style={styles.emptyText}>
              Try searching with another
              keyword.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },

  heading: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 15,
  },

  subHeading: {
    color: COLORS.muted,
    marginBottom: 20,
    fontSize: 15,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  topRow: {
    flexDirection: "row",
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  icon: {
    fontSize: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },

  meta: {
    color: COLORS.muted,
    marginTop: 6,
    fontSize: 13,
  },

  description: {
    color: COLORS.text,
    opacity: 0.8,
    marginTop: 10,
    lineHeight: 20,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },

  chatBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  chatText: {
    color: "#03131A",
    fontWeight: "700",
    marginLeft: 8,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 120,
  },

  emptyIcon: {
    fontSize: 60,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  emptyText: {
    color: COLORS.muted,
    marginTop: 10,
    textAlign: "center",
  },
});