import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";

import {auth} from "../config/firebase";
import { getUserLostReports,deleteLostReport,markAsFound} from "../services/lostServices";

const LostReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
  try {
    console.log("Fetching reports...");


    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }

    console.log("User:", auth.currentUser.uid);

    const data = await getUserLostReports(
      auth.currentUser.uid
    );

    console.log("Reports:", data);

    setReports(data);
  } catch (error) {
    console.log("Fetch Error:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
    fetchReports();
}, []);

  const handleMarkFound = async (reportId) => {
    try{
      await markAsFound(reportId);

      Alert.alert("Success", "Report marked as found.");
      fetchReports();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteReport = async (reportId) => {
   
      Alert.alert("Deleted", "Report has been deleted.",
        [{
          text:"Cancel",
          style:"cancel"
        },
        {
          text:"Delete",
          style:"destructive",
          onPress: async() =>{
            try{
            await deleteLostReport(reportId);
            fetchReports();

          }
          catch(error){
            console.log(error);
          }
        },
      
        }]
      );
    }
  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "found":
      return {
        bg: "rgba(92,225,198,0.18)",
        border: "rgba(92,225,198,0.4)",
      };

    case "pending":
      return {
        bg: "rgba(255,165,0,0.18)",
        border: "rgba(255,165,0,0.4)",
      };

    default:
      return {
        bg: "rgba(239,68,68,0.18)",
        border: "rgba(239,68,68,0.4)",
      };
  }
};

const renderItem = ({ item }) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("LostReportDetails", {
          reportId: item.id,
        })
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusStyle.bg,
              borderColor:
                statusStyle.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={styles.statusText}
          >
            {(
              item.status ||
              "pending"
            ).toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.location}>
          📍{" "}
          {item.location ||
            "Unknown Location"}
        </Text>

        <Text style={styles.category}>
          {item.category || "Other"}
        </Text>
      </View>

      <Text style={styles.date}>
        {item.lostDate ||
          "Not Available"}
      </Text>

      <View style={styles.actionRow}>
        {/* <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            navigation.navigate(
              "LostReportDetails",
              {
                reportId: item.id,
              }
            )
          }
        >
          <Text
            style={styles.buttonText}
          >
            Details
          </Text>
        </TouchableOpacity> */}

        {item.status !== "found" && (
          <TouchableOpacity
            style={
              styles.markFoundButton
            }
            onPress={() =>
              handleMarkFound(item.id)
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Found ✓
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          handleDeleteReport(item.id)
        }
      >
        <Text
          style={styles.buttonText}
        >
          Delete Report
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5CE1C6" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          No Lost Reports Found
        </Text>

        <Text style={styles.emptyText}>
          Be the first to report a lost item.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

export default LostReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061320",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#061320",
  },

  loadingText: {
    color: "#CBD5E1",
    marginTop: 14,
    fontSize: 15,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },

  emptyText: {
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#0E1A2B",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.15)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    minWidth: 80,
    alignItems: "center",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  description: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },

  location: {
    color: "#5CE1C6",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },

  category: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 6,
  },

  date: {
    color: "#94A3B8",
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#1D3557",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  markFoundButton: {
    flex: 1,
    backgroundColor: "#5CE1C6",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    marginTop: 12,
    backgroundColor: "#EF4444",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});