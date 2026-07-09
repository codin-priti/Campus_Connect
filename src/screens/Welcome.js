import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from "react-native";

const { width } = Dimensions.get("window");

const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";

// ─────────────────────────────────────────────────────────────
// Floating Item Card
// ─────────────────────────────────────────────────────────────
function FloatingCard({ emoji, label, style, delay = 0 }) {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: 1,
          duration: 2500 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 2500 + delay,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  return (
    <Animated.View
      style={[
        styles.floatingCard,
        style,
        { transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.floatingEmoji}>{emoji}</Text>
      <Text style={styles.floatingLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// Lost & Found Icon
// ─────────────────────────────────────────────────────────────
function LostFoundIcon() {
  return (
    <View style={styles.iconWrapper}>
      <View style={styles.iconGlow} />

      <View style={styles.iconCircle}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInner} />
        </View>

        <View style={styles.searchRing} />

        <View style={styles.searchHandle} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BG}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Floating Cards */}
      <View style={styles.floatingRow}>
  <FloatingCard emoji="🎒" label="Bag" />
  <FloatingCard emoji="🆔" label="ID Card" delay={300} />
  <FloatingCard emoji="📚" label="Books" delay={600} />
  <FloatingCard emoji="🧴" label="Bottle" delay={900} />
</View>

        {/* Main Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
Lost & Found Buddy            </Text>
          </View>

          {/* Icon */}
          <View style={{ marginTop: 22, marginBottom: 20 }}>
            <LostFoundIcon />
          </View>

          {/* Heading */}
          <Text style={styles.title}>
  Lost Something{"\n"}
  <Text style={styles.highlight}>
    At School?
  </Text>
</Text>
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Report lost items, discover found belongings,
            {"\n"}
            and reconnect people with their valuables.
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Tracking</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Safe</Text>
              <Text style={styles.statLabel}>Recovery</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate("Login")}
            >
              <Text style={styles.primaryBtnText}>
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate("Register")}
            >
              <Text style={styles.secondaryBtnText}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Securely helping people recover lost belongings
          </Text>
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Floating row
  floatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  floatingCard: {
    width: (width - 56) / 4,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.15)",
    alignItems: "center",
  },

  floatingEmoji: {
    fontSize: 22,
    marginBottom: 5,
  },

  floatingLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },

  // Main card
  card: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.14)",
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: "rgba(92,225,198,0.10)",
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.2)",
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    marginRight: 8,
  },

  badgeText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // Icon
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(92,225,198,0.08)",
  },

  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(92,225,198,0.08)",
    borderWidth: 2,
    borderColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  pinOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  pinInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },

  searchRing: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: PRIMARY,
  },

  searchHandle: {
    position: "absolute",
    width: 4,
    height: 18,
    backgroundColor: PRIMARY,
    borderRadius: 4,
    right: 20,
    bottom: 18,
    transform: [{ rotate: "45deg" }],
  },

  // Text
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 42,
  },

  highlight: {
    color: PRIMARY,
  },

  subtitle: {
    marginTop: 12,
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    paddingVertical: 14,
    width: "100%",
    justifyContent: "space-around",
  },

  statBox: {
    alignItems: "center",
  },

  statNumber: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: "800",
  },

  statLabel: {
    marginTop: 3,
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
  },

  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  // Buttons
  buttonContainer: {
    width: "100%",
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  primaryBtnText: {
    color: BG,
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(92,225,198,0.25)",
    backgroundColor: "rgba(92,225,198,0.05)",
  },

  secondaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Footer
  footer: {
    marginTop: 18,
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textAlign: "center",
  },
});