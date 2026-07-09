import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  getUserPosts,
  deletePost,
  archivePost,
  resolvePost,
} from "../services/postServices";
import { auth } from "../config/firebase";

const PostHistoryScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      if (!auth.currentUser) {
        setPosts([]);
        return;
      }

      const userId = auth.currentUser.uid;
      const data = await getUserPosts(userId);

      setPosts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleArchive = async (postId) => {
  try {
    await archivePost(postId);
    loadPosts();
  } catch (error) {
    console.log(error);
  }
};

const handleResolve = async (postId) => {
  try {
    await resolvePost(postId);
    loadPosts();
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (postId) => {
  try {
    await deletePost(postId);
    loadPosts();
  } catch (error) {
    console.log(error);
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5CE1C6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Posts</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No posts found</Text>
        )}
        renderItem={({ item }) => {
          const statusText =
            item.status === "resolved"
              ? "✅ Item Received"
              : item.status === "archived"
              ? "📦 Archived"
              : "🟠 Active";

          return (
            <View style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("PostDetails", {
                    postId: item.id,
                  })
                }
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <Text style={styles.location}>📍 {item.location}</Text>
                <Text
                  style={[
                    styles.status,
                    item.status === "resolved"
                      ? styles.resolved
                      : item.status === "archived"
                      ? styles.found
                      : styles.pending,
                  ]}
                >
                  {statusText}
                </Text>
              </View>

              <View style={styles.actionRow}>
                {item.status === "active" && (
                  <>
                    <TouchableOpacity
                      style={styles.archiveButton}
                      onPress={() => handleArchive(item.id)}
                    >
                      <Text style={styles.buttonText}>Archive</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => handleResolve(item.id)}
                    >
                      <Text style={styles.buttonText}>Item Received</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default PostHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },
  resolved: {
    color: "#4CAF50",
  },

  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    paddingTop: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  archiveButton: {
    flex: 1,
    backgroundColor: "#5CE1C6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  resolveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#FF5A5A",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },

  card: {
    backgroundColor: "#0F1C2E",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  description: {
    color: "#aaa",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  location: {
    color: "#5CE1C6",
  },

  status: {
    fontWeight: "700",
    textTransform: "capitalize",
  },

  found: {
    color: "#00D26A",
  },

  pending: {
    color: "#FFA500",
  },
});