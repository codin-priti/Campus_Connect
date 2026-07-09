import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { auth } from "../config/firebase";
const MatchResultsScreen = ({ route, navigation }) => {
  const { matches = [] } = route.params || {};
const currentUser = {
  uid: auth.currentUser?.uid,
  name:
    auth.currentUser?.displayName ||
    auth.currentUser?.email,
  photoURL:
    auth.currentUser?.photoURL || "",
};
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Possible Matches
      </Text>

      <Text style={styles.subHeading}>
        We found {matches.length} possible matches
      </Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            No matching items found.
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>
                {item.matchScore}%
              </Text>
            </View>

            <Text style={styles.title}>
              {item.itemName || item.title}
            </Text>

            <Text style={styles.location}>
              📍 {item.location}
            </Text>

            <Text style={styles.description}>
              {item.description}
            </Text>

            <Text style={styles.contact}>
              Contact: {item.contactName}
            </Text>

            <Text style={styles.contact}>
              Phone: {item.contactPhone}
            </Text>

            

<TouchableOpacity
  style={styles.chatButton}
  onPress={() => {
    console.log("MATCH ITEM:", item);

    navigation.navigate("Chat", {
      otherUser: {
        uid: item.userId,
        name: item.contactName,
      },
    });
  }}
>
  <Text style={styles.chatButtonText}>
    Contact Owner
  </Text>
</TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default MatchResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  heading: {
    paddingTop:30,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5,
  },

  subHeading: {
    color: "#aaa",
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: "#5CE1C6",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },

  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 50,
  },

  card: {
    backgroundColor: "#0F1C2E",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },

  scoreBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#5CE1C6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },

  scoreText: {
    color: "#07111F",
    fontWeight: "700",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  location: {
    color: "#5CE1C6",
    marginTop: 6,
  },

  description: {
    color: "#aaa",
    marginTop: 8,
  },

  contact: {
    color: "#fff",
    marginTop: 6,
  },

  button: {
    backgroundColor: "#5CE1C6",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#07111F",
    fontWeight: "700",
  },
});