import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { getPostById } from "../services/postServices";

const PostDetailsScreen = ({ route, navigation }) => {
  const { postId } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId) {
          setPost(null);
          return;
        }

        const data = await getPostById(postId);
        setPost(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5CE1C6" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Post not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>{post.title || "Untitled Post"}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{post.description || "No description provided."}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{post.location || "Unknown location"}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.status, post.status === "archived" ? styles.archived : styles.active]}>
          {post.status || "active"}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#07111F",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
    padding: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#0F1C2E",
    borderRadius: 15,
    padding: 16,
  },
  label: {
    color: "#5CE1C6",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },
  value: {
    color: "#fff",
    marginTop: 4,
    fontSize: 16,
  },
  status: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  active: {
    color: "#FFA500",
  },
  archived: {
    color: "#00D26A",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#5CE1C6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#07111F",
    fontWeight: "700",
  },
  emptyText: {
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
});
