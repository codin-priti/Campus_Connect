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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const { width, height } = Dimensions.get("window");

import { loginUser } from "../services/authServices";

const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";
const BORDER = "rgba(92,225,198,0.16)";

// ─────────────────────────────────────────────────────────────
// Input Field
// ─────────────────────────────────────────────────────────────
function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "rgba(92,225,198,0.16)",
      "rgba(92,225,198,0.8)",
    ],
  });

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={[styles.inputContainer, { borderColor }]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.28)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => {
            Animated.timing(borderAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: false,
            }).start();
          }}
          onBlur={() => {
            Animated.timing(borderAnim, {
              toValue: 0,
              duration: 180,
              useNativeDriver: false,
            }).start();
          }}
        />
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 55,
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

  const handleLogin = async () => {
    if(!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try{
      setLoading(true);
      setError("");

      const user = await loginUser(email, password);
      console.log("Logged in user:", user.email);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Grid Lines */}
      <View style={styles.gridOverlay}>
        {[...Array(9)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridLine,
              { top: (height / 9) * i },
            ]}
          />
        ))}
      </View>

      {/* Background Glow */}
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation?.goBack()}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              

              <Text style={styles.title}>
                Welcome{"\n"}
                <Text style={styles.highlight}>Back</Text>
              </Text>

           <Text style={styles.subtitle}>
  Find lost school bags, ID cards, books,
  bottles, and more within your school community.
</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <InputField
                label="EMAIL ADDRESS"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <InputField
                label="PASSWORD"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {
  error ? (
    <Text
      style={{
        color: "red",
        marginTop: 10,
      }}
    >
      {error}
    </Text>
  ) : null
}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Text style={styles.loginBtnText}>
  {loading ? "Logging In..." : "Log In"}
</Text>
            </TouchableOpacity>

            {/* OR Divider */}
            {/* <View style={styles.orRow}>
              <View style={styles.orLine} />

              <Text style={styles.orText}>
                or continue with
              </Text>

              <View style={styles.orLine} />
            </View>

            {/* Social Buttons */}
            {/* <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialText}>G</Text>
              </TouchableOpacity>

              
            </View> */} 

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don’t have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate("Register")
                }
              >
                <Text style={styles.footerLink}>
                  {" "}
                 Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  // Background Glow
  glowOne: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(92,225,198,0.08)",
  },

  glowTwo: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(92,225,198,0.05)",
  },

  // Grid
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  // Card
  card: {
    width: width * 0.88,
    backgroundColor: CARD,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 34,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  // Back Button
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backArrow: {
    color: PRIMARY,
    fontSize: 18,
    marginRight: 6,
  },

  backText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },

  // Header
  header: {
    alignItems: "flex-start",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: "rgba(92,225,198,0.10)",
    borderWidth: 1,
    borderColor: "rgba(92,225,198,0.2)",
    marginBottom: 22,
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
    letterSpacing: 1.4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
    marginBottom: 12,
  },

  highlight: {
    color: PRIMARY,
  },

  subtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    lineHeight: 22,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PRIMARY,
    marginHorizontal: 10,
  },

  // Form
  form: {
    gap: 16,
  },

  fieldWrap: {
    gap: 8,
  },

  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  input: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 2,
  },

  forgotText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "600",
  },

  // Login Button
  loginBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 26,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  loginBtnText: {
    color: BG,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  // OR Divider
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  orText: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "500",
  },

  // Social Buttons
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 28,
  },

  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  socialText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 14,
  },

  footerLink: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "700",
  },
});