// screens/HomeScreen.js

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
  Alert
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "../services/authServices";


import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { registerForPushNotifications } from "../services/notificationServices";
const { width } = Dimensions.get("window");

import { useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";


const CATEGORIES = [
  "School ID Card",
  "School Bag",
  "Water Bottle",
  "Lunch Box",
  "Notebook",
  "Textbook",
  "Pencil Box",
  "Pen / Pencil",
  "Calculator",
  "Geometry Box",
  "School Uniform",
  "Shoes",
  "Sweater / Jacket",
  "Watch",
  "Spectacles",

  "Keys",
  "Wallet",
  "Documents",
  "Sports Equipment",
  "Art Supplies",
  "Umbrella",
  "Other",
];
const LOCATIONS = [
  "Main Gate",
  "Classroom",
  "Library",
  "Computer Lab",
  "Science Lab",
  "Staff Room",
  "School Office",
  "Playground",
  "Canteen",
  "Corridor",
  "Washroom",
  "School Bus",
  "Bus Stop",
  "Medical Room",
  "Auditorium",
  "Other",
];
const REPORT_TYPES = ["All", "Lost", "Found"];

const COLORS = {
  bg: "#03131A",
  card: "#0B1F2A",
  card2: "#102B38",
  primary: "#64E7D6",
  secondary: "#FFB85C",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.06)",
};


export default function HomeScreen({ navigation }) {
  const [active, setActive] = useState("All");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [category, setCategory] = useState("");
  const [landmark, setLandmark] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");

  const [filter, setFilter] = useState("all");

  const FILTERS = ["All", "Lost", "Found"];

  const filteredReports = reports.filter((report) => {
    const search = searchText.trim().toLowerCase();

    // Filter by Lost/Found
    const matchesType =
      selectedFilter === "All" ||
      report.type?.toLowerCase() ===
      selectedFilter.toLowerCase();

    // Filter by item name
    const matchesText =
      search === "" ||
      report.title?.toLowerCase().includes(search) ||
      report.description?.toLowerCase().includes(search) ||
      report.category?.toLowerCase().includes(search) ||
      report.location?.toLowerCase().includes(search);



    // Filter by date
    const matchesDate =
      searchDate.trim() === "" ||
      report.lostDate === searchDate ||
      report.foundDate === searchDate;

    const matchesCategory =
      category === "" ||
      report.category === category;

    const matchesLandmark =
      landmark === "" ||
      report.landmark === landmark;

    const matchesReportType =
      type === "All" ||
      report.type?.toLowerCase() === type.toLowerCase();



    return (
      matchesType &&
      matchesText &&
      matchesDate &&
      matchesCategory &&
      matchesLandmark &&
      matchesReportType
    );
  });

  filteredReports.forEach((report) => {
  console.log(
    report.title,
    {
      matchesType:
        selectedFilter === "All" ||
        report.type?.toLowerCase() ===
          selectedFilter.toLowerCase(),

      matchesLandmark:
        landmark === "" ||
        report.landmark === landmark,

      matchesCategory:
        category === "" ||
        report.category === category,

      matchesReportType:
        type === "All" ||
        report.type?.toLowerCase() === type.toLowerCase(),
    }
  );
});
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const seconds = Math.floor(
      (new Date() - date) / 1000
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;

    const days = Math.floor(hours / 24);
    return `${days} day ago`;
  };

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutUser();
              navigation.replace("Login");
            } catch (error) {
              console.log("Logout Error:", error);
              Alert.alert(
                "Error",
                "Failed to logout. Please try again."
              );
            }
          },
        },
      ]
    );
  }, [navigation]);

const handleSearch = async () => {
  try {
    const [foundSnap, lostSnap] = await Promise.all([
      getDocs(collection(db, "posts")),
      getDocs(collection(db, "lostReports")),
    ]);

    const allReports = [
      ...foundSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      ...lostSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    ];

    const search = searchText.trim().toLowerCase();

console.log("Search Text:", search);
console.log("Total Reports:", allReports.length);
console.log("All Reports:", allReports);

const results = allReports.filter((item) => {
  const matchesText =
    search === "" ||
    item.title?.toLowerCase().includes(search) ||
    item.description?.toLowerCase().includes(search) ||
    item.category?.toLowerCase().includes(search) ||
    item.location?.toLowerCase().includes(search);

  const matchesDate =
    searchDate.trim() === "" ||
    item.lostDate === searchDate ||
    item.foundDate === searchDate;

  const matchesCategory =
    category === "" ||
    category === "All" ||
    item.category === category;

 const matchesLandmark =
  landmark === "" ||
  landmark === "All" ||
  item.landmark?.trim().toLowerCase() ===
    landmark.trim().toLowerCase();

  const matchesType =
    type === "All" ||
    item.type?.toLowerCase() === type.toLowerCase();

  console.log(item.title, {
    type: item.type,
    matchesText,
    matchesDate,
    matchesCategory,
    matchesLandmark,
    matchesType,
    final:
      matchesText &&
      matchesDate &&
      matchesCategory &&
      matchesLandmark &&
      matchesType,
  });

  return (
    matchesText &&
    matchesDate &&
    matchesCategory &&
    matchesLandmark &&
    matchesType
  );
});

console.log("FINAL RESULTS:", results);
setSearchModalVisible(false);

navigation.navigate("SearchResults", {
  results,
  searchText,
});
  } catch (error) {
    console.log("Search Error:", error);
  }
};
  const renderChipGroup = useCallback(
    (items, selected, onSelect) => (
      <View style={styles.chipContainer}>
        {items.map((item) => {
          const active = selected === item;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => onSelect(item)}
            >
              <Text style={active ? styles.activeChipText : styles.chipText}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    []
  );

  useEffect(() => {
    const savePushToken = async () => {
      if (!auth.currentUser) return;

      const token =
        await registerForPushNotifications();

      if (!token) return;

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          expoPushToken: token,
        },
        { merge: true }
      );

      console.log(
        "Push Token Saved:",
        token
      );
    };

    savePushToken();
  }, []);

useFocusEffect(
  React.useCallback(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q1 = query(
      collection(db, "posts"),
      where("userId", "==", user.uid)
    );

    const q2 = query(
      collection(db, "lostReports"),
      where("userId", "==", user.uid)
    );

    let foundReports = [];
    let lostReports = [];

   const unsubscribe1 = onSnapshot(q1, (snapshot) => {
  foundReports = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("FOUND REPORTS:", foundReports);
  console.log("LOST REPORTS BEFORE:", lostReports);

  setReports([...foundReports, ...lostReports]);
});

const unsubscribe2 = onSnapshot(q2, (snapshot) => {
  lostReports = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("LOST REPORTS:", lostReports);
  console.log("FOUND REPORTS BEFORE:", foundReports);

  setReports([...foundReports, ...lostReports]);
});

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [])
);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}

      >
        <View style={{ height: 20 }} />



        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>
              Welcome back 👋
            </Text>

            <Text style={styles.logo}>
              Campus<Text style={styles.logoAccent}>
                Connect
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutIcon}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={28}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => setSearchModalVisible(true)}
        >
          <Text style={styles.searchPlaceholder}>
            🔍 Search lost or found items...
          </Text>
        </TouchableOpacity>

        {/* <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.slice(0, 8).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.categoryChip}
              >
                <Text style={styles.categoryText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}


        <Modal
          visible={searchModalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
              >
                <Text style={styles.modalTitle}>
                  Search Reports
                </Text>

                <TextInput
                  placeholder="Item name.."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.modalInput}
                  value={searchText}
                  onChangeText={setSearchText}
                />

                <TextInput
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.modalInput}
                  value={searchDate}
                  onChangeText={setSearchDate}
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Landmark</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={location}
                    onValueChange={(value) =>
                      setLocation(value)
                    }
                    dropdownIconColor="#5CE1C6"
                    style={styles.picker}
                  >
                    {LOCATIONS.map((item) => (
                      <Picker.Item
                        key={item}
                        label={item}
                        value={item}
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Category</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(value) =>
                      setCategory(value)
                    }
                    dropdownIconColor="#5CE1C6"
                    style={styles.picker}
                  >
                    {CATEGORIES.map((item) => (
                      <Picker.Item
                        key={item}
                        label={item}
                        value={item}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.typeRow}>
                  {REPORT_TYPES.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setType(option)}
                      style={[
                        styles.typeChip,
                        type === option &&
                        styles.typeChipActive,
                      ]}
                    >
                      <Text
                        style={
                          type === option
                            ? styles.typeChipTextActive
                            : styles.typeChipText
                        }
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={handleSearch}
                >
                  <Text style={styles.searchBtnText}>
                    Search
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setSearchModalVisible(false)
                  }
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>


        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <Text style={styles.heroTitle}>
            Lost something?
          </Text>

          <Text style={styles.heroSubtitle}>
            Report lost and found items instantly and reconnect people with their belongings.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.lostBtn}
              onPress={() => navigation.navigate("ReportLost")}
            >
              <Text style={styles.lostBtnText}>Report Lost</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.foundBtn}
              onPress={() => navigation.navigate("ReportFound")}
            >
              <Text style={styles.foundBtnText}>Report Found</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* QUICK ACTIONS */}
        <View style={styles.dashboardActions}>
          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() =>
              navigation.navigate("LostReports", {
                type: "Lost",
              })
            }
          >
            <View style={styles.dashboardIconContainer}>
              <Text style={styles.dashboardIcon}>❓</Text>
            </View>

            <Text style={styles.dashboardTitle}>
              Lost Items
            </Text>

            <Text style={styles.dashboardDescription}>
              View all lost reports
            </Text>

            <Text style={styles.dashboardLink}>
              Browse →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardCard}
            onPress={() =>
              navigation.navigate("PostHistory", {
                type: "Found",
              })
            }
          >
            <View
              style={[
                styles.dashboardIconContainer,
                {
                  backgroundColor:
                    "rgba(100,231,214,0.15)",
                },
              ]}
            >
              <Text style={styles.dashboardIcon}>
                📦
              </Text>
            </View>

            <Text style={styles.dashboardTitle}>
              Found Items
            </Text>

            <Text style={styles.dashboardDescription}>
              View recovered items
            </Text>

            <Text style={styles.dashboardLink}>
              Browse →
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter &&
                styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                  styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* REPORT CARDS */}
        {filteredReports.map((item) => (<TouchableOpacity
          key={item.id}
          style={styles.reportCard}
        >
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
            <Text style={styles.emoji}>
              {item.type === "found" ? "📦" : "❓"}
            </Text>
          </View>

          <View style={styles.flexOne}>
            <Text style={styles.reportTitle}>
              {item.title}
            </Text>

            <Text style={styles.reportMeta}>
              {item.location} • {item.category}
            </Text>
          </View>

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
                      ? "#64E7D6"
                      : "#FFB85C",
                },
              ]}
            >
{item.status?.toUpperCase() || item.type?.toUpperCase()}            </Text>
          </View>
        </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("RecentChats")}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  fabIcon: {
    fontSize: 40

  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 15,
  },

  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#0F1C2E",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.15)",
  },

  activeFilter: {
    backgroundColor: "#5CE1C6",
    borderColor: "#5CE1C6",
  },

  filterText: {
    color: "#AAB7C4",
    fontSize: 14,
    fontWeight: "600",
  },

  activeFilterText: {
    color: "#061320",
    fontWeight: "700",
  },

  modalInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: COLORS.text,
    marginBottom: 15,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  pickerContainer: {
    backgroundColor: "#0F1C2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.25)",
    marginBottom: 16,
    overflow: "hidden",
  },

  picker: {
    color: "#fff",
  },

  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  typeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
  },

  typeChipActive: {
    backgroundColor: COLORS.primary,
  },

  typeChipText: {
    color: COLORS.text,
    fontWeight: "700",
  },

  typeChipTextActive: {
    color: COLORS.bg,
    fontWeight: "700",
  },

  logoAccent: {
    color: COLORS.primary,
  },

  searchPlaceholder: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 15,
  },

  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  searchBtnText: {
    color: COLORS.bg,
    fontWeight: "700",
    fontSize: 16,
  },

  cancelText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 15,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },



  heading: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },

  logoutIcon: {
    padding: 6,
    marginTop: 5,
  },

  smallText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  reportActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  dashboardActions: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 14,
  },

  dashboardCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  dashboardIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,184,92,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  dashboardIcon: {
    fontSize: 24,
  },

  dashboardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
  },

  dashboardDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },

  dashboardLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
  },

  reportActionBtn: {
    flex: 1,
    backgroundColor: "rgba(100,231,214,0.08)",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },

  categoryChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  categoryText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  reportActionText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  logo: {
    fontSize: 34,
    color: COLORS.text,
    fontWeight: "800",
    marginTop: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(100,231,214,0.1)",
  },

  avatarText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  searchContainer: {
    marginTop: 25,
    paddingHorizontal: 30,
  },

  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.15)",
  },

  heroCard: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(100,231,214,0.08)",
    top: -80,
    right: -60,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },

  heroSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },

  heroButtons: {
    flexDirection: "row",
    marginTop: 28,
    gap: 14,
  },

  lostBtn: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  foundBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  lostBtnText: {
    color: "#111",
    fontWeight: "700",
  },

  foundBtnText: {
    color: "#111",
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 22,
  },

  statCard: {
    width: (width - 56) / 3,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  statNumber: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "800",
  },

  statLabel: {
    color: COLORS.muted,
    marginTop: 6,
    fontSize: 12,
  },

  sectionHeader: {
    marginTop: 34,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },

  seeAll: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 10,
  },

  filterBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },

  filterBtnActive: {
    backgroundColor: "rgba(100,231,214,0.16)",
  },

  filterText: {
    color: COLORS.muted,
    fontWeight: "600",
  },

  filterTextActive: {
    color: COLORS.primary,
  },

  reportCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emoji: {
    fontSize: 28,
  },

  reportTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  flexOne: {
    flex: 1,
  },

  reportMeta: {
    color: COLORS.muted,
    marginTop: 6,
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  fabPlus: {
    fontSize: 34,
    color: "#021014",
    marginTop: -2,
  },
});