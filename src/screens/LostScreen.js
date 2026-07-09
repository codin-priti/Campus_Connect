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
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import { auth } from "../config/firebase";
import { createLostItem } from "../services/lostServices";
import { getPossibleMatches } from "../services/matchServices";
const { width } = Dimensions.get("window");


const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";
const BORDER = "rgba(92,225,198,0.14)";
const MUTED = "rgba(255,255,255,0.4)";
const AMBER = "#F4A855";

// ─────────────────────────────────────────────────────────────
// Category options
// ─────────────────────────────────────────────────────────────
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
const CONDITIONS = ["Good", "Fair", "Damaged"];

// ─────────────────────────────────────────────────────────────
// STEP BAR
// ─────────────────────────────────────────────────────────────
function StepBar({ current, total }) {
  return (
    <View style={styles.stepBar}>
      {[...Array(total)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepSegment,
            i < current && styles.stepSegmentDone,
            i === current && styles.stepSegmentActive,
          ]}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// FIELD
// ─────────────────────────────────────────────────────────────
function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  hint,
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(92,225,198,0.18)", "rgba(92,225,198,0.75)"],
  });

  return (
    <View style={styles.fieldWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>

      <Animated.View
        style={[
          styles.inputBox,
          { borderColor },
          multiline && styles.inputBoxMulti,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.22)"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() =>
            Animated.timing(borderAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }).start()
          }
          onBlur={() =>
            Animated.timing(borderAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start()
          }
        />
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// PHOTO SLOT
// ─────────────────────────────────────────────────────────────
function PhotoSlot({ filled, onPress, index }) {
  return (
    <TouchableOpacity
      style={[styles.photoSlot, filled && styles.photoSlotFilled]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {filled ? (
        <>
          <View style={styles.photoFilledBadge}>
            <Text style={styles.photoFilledCheck}>✓</Text>
          </View>

          <Text style={styles.photoFilledText}>
            Photo {index + 1}
          </Text>
        </>
      ) : (
        <>
          <View style={styles.photoPlus}>
            <View style={styles.plusH} />
            <View style={styles.plusV} />
          </View>

          {index === 0 && (
            <Text style={styles.photoHint}>Add Photo</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────
function SuccessScreen({ onDone }) {
  return (
    <View style={styles.successWrap}>
      <View style={styles.successCircle}>
        <Text style={styles.successCheck}>✓</Text>
      </View>

      <Text style={styles.successTitle}>
        Lost Report Posted!
      </Text>

      <Text style={styles.successSubtitle}>
        Your lost item report has been submitted successfully.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onDone}
      >
        <Text style={styles.primaryBtnText}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────
export default function ReportLostScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 0
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState(null);
  const [photos, setPhotos] = useState([
    false,
    false,
    false,
  ]);

  // STEP 1
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [matches, setMatches] = useState([]);
  const [reportId, setReportId] = useState(null);

  // STEP 2
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

 

const canProceed = () => {
  if (step === 0) {
    return (
      category !==""&&
      title.trim().length >= 3 &&
      description.trim().length >= 10 &&
      condition
    );
  }

  if (step === 1) {
    return (
location &&
/^\d{2}\/\d{2}\/\d{4}$/.test(lostDate)    );
  }

  if (step === 2) {
    return (
      contactName.trim().length >= 2 &&
      /^[0-9]{10}$/.test(contactPhone)
    );
  }

  return true;
};
  // ─────────────────────────────────────────────────────────────
  // POST LOST REPORT
  // ─────────────────────────────────────────────────────────────
  const postLostReport = async () => {
  try {
    setLoadingMatches(true);
    setLoading(true);
    setError("");

    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "You must be signed in to post a lost report."
      );
    }

    const payload = {
      type: "lost",
      category,
      title: title.trim().replace(/\s+/g, " "),
description: description.trim().replace(/\s+/g, " "),
      condition,

      location: location.trim(),
      landmark: landmark.trim(),
      lostDate,

      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),

      photos,

      userId: currentUser.uid,
    };

    // Save Lost Report
    const reportId = await createLostItem(payload);

    console.log(
      "Lost Report Created Successfully:",
      reportId
    );

    // Find Matches
    const matches = await getPossibleMatches(payload);

    console.log("Matches Found:", matches);

    setLoadingMatches(false);

    // No Match Found
    if (matches.length === 0) {
      setLoading(false);
  setLoadingMatches(false);

      Alert.alert(
        "No Matches Found",
        "We couldn't find any similar found items nearby.",
        [
          {
            text: "Go Home",
            onPress: () =>
              navigation.replace("Home"),
          },
        ]
      );

      return;
    }

    // Navigate to Match Screen
    navigation.replace("MatchScreen", {
      matches,
      reportId,
    });
  } catch (err) {
    console.log("Lost report submission error:", err);

    Alert.alert(
      "Error",
      err?.message ||
        "Failed to post lost report."
    );

    setError(
      err?.message ||
        "Failed to post lost report."
    );
  } finally {
    setLoading(false);
    setLoadingMatches(false);
  }
};

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      await postLostReport();
    }
  };

  if (loadingMatches) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ActivityIndicator
        size="large"
        color="#5CE1C6"
      />

      <Text style={{ color: "#fff", marginTop: 15 }}>
        Searching for matching items...
      </Text>
    </SafeAreaView>
  );
}



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BG}
      />

      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              step > 0
                ? setStep(step - 1)
                : navigation?.goBack()
            }
          >
            <Text style={{ color: "#fff" }}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>
              Report Lost Item
            </Text>

            <Text style={styles.headerStep}>
              Step {step + 1} of 3
            </Text>
          </View>

          <View style={styles.lostBadge}>
            <Text style={styles.lostBadgeText}>
              LOST
            </Text>
          </View>
        </View>

        <StepBar current={step} total={3} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* STEP 0 */}
            {step === 0 && (
              <View style={styles.stepContent}>
                <View style={styles.sectionCard}>
                  

                  {/* <View style={styles.photoRow}>
                    {photos.map((filled, i) => (
                      <PhotoSlot
                        key={i}
                        filled={filled}
                        index={i}
                        onPress={() => togglePhoto(i)}
                      />
                    ))}
                  </View> */}
                </View>

                <Text style={styles.label}>Category</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={category}
    onValueChange={(itemValue) =>
      setCategory(itemValue)
    }
    style={styles.picker}
    dropdownIconColor="#5CE1C6"
    hint="Required"
  >
    <Picker.Item
      label="Select Category"
      value=""
    />

    {CATEGORIES.map((item) => (
      <Picker.Item
        key={item}
        label={item}
        value={item}
      />
    ))}
  </Picker>
</View>

                <View style={styles.sectionCard}>
                  <Field
                    label="Item Title"
                    placeholder="e.g. Black Wallet"
                    value={title}
                    onChangeText={setTitle}
                    hint="Required"
                  />

                  <View style={{ height: 14 }} />

                  <Field
                    label="Description"
                    placeholder="Describe the item..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    Condition
                  </Text>

                  <View style={styles.conditionRow}>
                    {CONDITIONS.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.conditionChip,
                          condition === c &&
                            styles.conditionChipActive,
                        ]}
                        onPress={() =>
                          setCondition(c)
                        }
                      >
                        <Text
                          style={[
                            styles.conditionText,
                            condition === c &&
                              styles.conditionTextActive,
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.sectionCard}>
                 <Text style={styles.label}>
  Where was it lost?
</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={location}
    onValueChange={(itemValue) =>
      setLocation(itemValue)
    }
    style={styles.picker}
    dropdownIconColor="#5CE1C6"
  >
    <Picker.Item
      label="Select Landmark"
      value=""
    />

    {LOCATIONS.map((item) => (
      <Picker.Item
        key={item}
        label={item}
        value={item}
      />
    ))}
  </Picker>
</View>

                  <View style={{ height: 14 }} />

                  <Field
                    label="Nearest locations"
                    placeholder="Near gate, cafe, etc"
                    value={landmark}
                    onChangeText={setLandmark}
                  />

                  <View style={{ height: 14 }} />

                 <Field
  label="Date Lost"
  placeholder="DD/MM/YYYY"
  value={lostDate}
   keyboardType="number-pad"
  hint=" DD/MM/YYYY (e.g. 01/07/2026)"
  onChangeText={(text) => {
    const cleaned = text
      .replace(/\D/g, "")
      .slice(0, 8);

    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2);
    }

    if (cleaned.length > 4) {
      formatted =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4);
    }

    setLostDate(formatted);
  }}
/>
                </View>
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.sectionCard}>
                  <Field
                    label="Your Name"
                    placeholder="John Doe"
                    value={contactName}
                    onChangeText={setContactName}
                    hint="Required"
                  />

                  <View style={{ height: 14 }} />

                  <Field
                    label="Phone Number"
                    placeholder="+91 9999999999"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {error ? (
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                ) : null}
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!canProceed() || loading) &&
                styles.primaryBtnDisabled,
            ]}
            disabled={!canProceed() || loading}
            onPress={handleNext}
          >
            {loading ? (
              <ActivityIndicator color={BG} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {step < 2
                  ? "Continue →"
                  : "Post Lost Report"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: CARD,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  headerStep: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  lostBadge: {
    backgroundColor: "rgba(255,80,80,0.15)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  pickerContainer: {
  backgroundColor: CARD,
  borderWidth: 1.5,
  borderColor: "rgba(92,225,198,0.25)",
  borderRadius: 14,
  marginTop: 8,
  overflow: "hidden",
},

picker: {
  color: "#fff",
  height: 55,
},

  lostBadgeText: {
    color: "#FF7070",
    fontWeight: "700",
    fontSize: 10,
  },

  stepBar: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  stepSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  stepSegmentActive: {
    backgroundColor: PRIMARY,
  },

  stepSegmentDone: {
    backgroundColor: "rgba(92,225,198,0.4)",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  stepContent: {
    padding: 16,
    gap: 14,
  },

  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },

  fieldWrap: {
    gap: 7,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
  },

  hint: {
    color: AMBER,
    fontSize: 10,
    fontWeight: "700",
  },

  inputBox: {
    borderWidth: 1.5,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  inputBoxMulti: {
    paddingVertical: 12,
  },

  input: {
    color: "#fff",
    fontSize: 14,
  },

  inputMulti: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryChip: {
    width: (width - 32 - 36 - 24) / 4,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
  },

  categoryChipActive: {
    backgroundColor: "rgba(92,225,198,0.12)",
    borderColor: PRIMARY,
  },

  categoryEmoji: {
    fontSize: 20,
  },

  categoryLabel: {
    color: MUTED,
    fontSize: 10,
    marginTop: 5,
  },

  categoryLabelActive: {
    color: PRIMARY,
  },

  conditionRow: {
    flexDirection: "row",
    gap: 10,
  },

  conditionChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },

  conditionChipActive: {
    backgroundColor: "rgba(92,225,198,0.12)",
    borderColor: PRIMARY,
    borderWidth: 1,
  },

  conditionText: {
    color: MUTED,
  },

  conditionTextActive: {
    color: PRIMARY,
  },

  photoRow: {
    flexDirection: "row",
    gap: 10,
  },

  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(92,225,198,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  photoSlotFilled: {
    borderStyle: "solid",
    borderColor: PRIMARY,
  },

  photoPlus: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  plusH: {
    position: "absolute",
    width: 18,
    height: 2,
    backgroundColor: PRIMARY,
  },

  plusV: {
    position: "absolute",
    width: 2,
    height: 18,
    backgroundColor: PRIMARY,
  },

  photoHint: {
    color: PRIMARY,
    fontSize: 10,
    marginTop: 5,
  },

  photoFilledBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  photoFilledCheck: {
    color: BG,
    fontWeight: "800",
  },

  photoFilledText: {
    color: PRIMARY,
    fontSize: 10,
    marginTop: 6,
  },

  footer: {
    backgroundColor: CARD,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },

  primaryBtnDisabled: {
    opacity: 0.4,
  },

  primaryBtnText: {
    color: BG,
    fontSize: 16,
    fontWeight: "800",
  },

  errorText: {
    color: "#FF7070",
    textAlign: "center",
    marginTop: 10,
  },

  successWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(92,225,198,0.15)",
    borderWidth: 3,
    borderColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  successCheck: {
    color: PRIMARY,
    fontSize: 40,
    fontWeight: "800",
  },

  successTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  successSubtitle: {
    color: MUTED,
    textAlign: "center",
    marginBottom: 30,
  },
});