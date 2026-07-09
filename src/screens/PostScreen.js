import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
} from "react-native";

import { createPost } from "../services/postServices";
import {auth} from '../config/firebase';
import {getLostMatchesForFoundItem } from '../services/matchServices';
import { Picker } from "@react-native-picker/picker";

import {ActivityIndicator} from 'react-native';

const { width } = Dimensions.get("window");

const PRIMARY = "#5CE1C6";
const BG = "#07111F";
const CARD = "#0F1C2E";
const BORDER = "rgba(92,225,198,0.14)";
const MUTED = "rgba(255,255,255,0.4)";
const AMBER = "#F4A855";

// ─────────────────────────────────────────────────────────────
// Student Friendly Categories
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "School ID Card", value: "School ID Card" },
  { label: "School Bag", value: "School Bag" },
  { label: "Water Bottle", value: "Water Bottle" },
  { label: "Lunch Box", value: "Lunch Box" },
  { label: "Notebook", value: "Notebook" },
  { label: "Textbook", value: "Textbook" },
  { label: "Pencil Box", value: "Pencil Box" },
  { label: "Pen / Pencil", value: "Pen / Pencil" },
  { label: "Calculator", value: "Calculator" },
  { label: "Geometry Box", value: "Geometry Box" },
  { label: "School Uniform", value: "School Uniform" },
  { label: "Shoes", value: "Shoes" },
  { label: "Sweater / Jacket", value: "Sweater / Jacket" },
  { label: "Watch", value: "Watch" },
  { label: "Spectacles", value: "Spectacles" },
  { label: "Keys", value: "Keys" },
  { label: "Wallet", value: "Wallet" },
  { label: "Documents", value: "Documents" },
  { label: "Sports Equipment", value: "Sports Equipment" },
  { label: "Art Supplies", value: "Art Supplies" },
  { label: "Umbrella", value: "Umbrella" },
  { label: "Other", value: "Other" },
];// ─────────────────────────────────────────────────────────────
// Campus Landmarks
// ─────────────────────────────────────────────────────────────
const LANDMARKS = [
  { label: "Main Gate", value: "Main Gate" },
  { label: "Classroom", value: "Classroom" },
  { label: "Library", value: "Library" },
  { label: "Computer Lab", value: "Computer Lab" },
  { label: "Science Lab", value: "Science Lab" },
  { label: "Staff Room", value: "Staff Room" },
  { label: "School Office", value: "School Office" },
  { label: "Playground", value: "Playground" },
  { label: "Canteen", value: "Canteen" },
  { label: "Corridor", value: "Corridor" },
  { label: "Washroom", value: "Washroom" },
  { label: "School Bus", value: "School Bus" },
  { label: "Bus Stop", value: "Bus Stop" },
  { label: "Medical Room", value: "Medical Room" },
  { label: "Auditorium", value: "Auditorium" },
  { label: "Other", value: "Other" },
];

const CONDITIONS = ["Good", "Fair", "Damaged"];

// ─────────────────────────────────────────────────────────────
// Step Bar
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
// Input Field
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
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.22)"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function ReportFoundScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [category, setCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState(null);

  // Step 2
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [foundDate, setFoundDate] = useState("");

  // Step 3
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const[loading, setLoading] = useState(false);
  const[error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const canProceed = () => {
  switch (step) {
    case 0:
      return (
        category !== "" &&
        title.trim().length >= 3 &&
        condition !== ""
      );

    case 1:
      return (
        landmark !== "" &&
        foundDate.trim() !== ""
      );

    case 2:
      return (
        contactName.trim().length >= 2 &&
        contactPhone.trim().length >= 10
      );

    default:
      return true;
  }
};

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUserId = auth.currentUser?.uid || null;

      if (!currentUserId) {
        throw new Error(
          "You must be signed in to post an item. Please login and try again."
        );
      }

      const postData = {
        type: "found",
        category,
        title: title.trim(),
        description: description.trim(),
        condition,
        location: location.trim(),
        landmark: landmark.trim(),
        foundDate,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        userId: currentUserId,
        status: "active",
      };

      const postId = await createPost(postData);

      console.log("Created Post:", postId);

      const matches = await getLostMatchesForFoundItem({
        id: postId,
        ...postData,
      });


      if (!matches || matches.length === 0) {
  Alert.alert(
    "No Matches Found",
    "Your found item has been posted successfully.",
    [
      {
        text: "Go Home",
        onPress: () => navigation.navigate("Home"),
      },
    ]
  );

  return;
}

navigation.navigate("MatchScreen", {
  matches,
  reportId: postId,
});

return;    } catch (error) {
      console.log("Post submission error:", error);
      setError(
        error?.message ||
          "Unable to post item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              step > 0 ? setStep(step - 1) : navigation.goBack()
            }
          >
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Report Found Item</Text>

          <Text style={styles.stepText}>{step + 1}/3</Text>
        </View>

        <StepBar current={step} total={3} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              padding: 16,
              gap: 14,
            }}
          >
            {/* STEP 1 */}
            {step === 0 && (
              <>
                {/* Categories */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Select Category</Text>
                     <View style={styles.pickerContainer}>
                      <Picker
                         selectedValue={category}
                         onValueChange={(value) => setCategory(value)}
                         dropdownIconColor="#5CE1C6"
                         style={styles.picker}
                         >
                          <Picker.Item
                            label="Select Category"
                            value=""
                            color="#888"
                           />
                           {CATEGORIES.map((item) =>(
                            <Picker.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            />


                           ))}
                         </Picker>
                     </View>
                </View>

                {/* Details */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Item Details</Text>

                  <Field
                    label="Title"
                    placeholder="Black Wallet"
                    value={title}
                    onChangeText={setTitle}
                    hint="Required"
                  />

                  <Field
                    label="Description"
                    placeholder="Describe the item..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />

                  <Text style={styles.label}>Condition</Text>

                  <View style={styles.conditionRow}>
                    {CONDITIONS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.conditionChip,
                          condition === item &&
                            styles.conditionChipActive,
                        ]}
                        onPress={() => setCondition(item)}
                      >
                        <Text
                          style={[
                            styles.conditionText,
                            condition === item &&
                              styles.conditionTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Found Location</Text>

                  <Field
                    label="General Location"
                    placeholder="College Campus"
                    value={location}
                    onChangeText={setLocation}
                  />


                  <Text style={styles.label}>Landmark</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={landmark}
    onValueChange={(value) => setLandmark(value)}
    dropdownIconColor="#5CE1C6"
    style={styles.picker}
  >
    <Picker.Item
      label="Select Landmark"
      value=""
      color="#888"
    />

    {LANDMARKS.map((item) => (
      <Picker.Item
        key={item.value}
        label={item.label}
        value={item.value}
      />
    ))}
  </Picker>
</View>

                  <View style={{ marginTop: 20 }}>
<Field
  label="Date Found"
  placeholder="DD/MM/YYYY"
  value={foundDate}
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

    setFoundDate(formatted);
  }}
  keyboardType="number-pad"
  hint=" DD/MM/YYYY (e.g. 01/07/2026)"
/>                  </View>
                </View>
              </>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Contact Info</Text>

                  <Field
                    label="Your Name"
                    placeholder="John Doe"
                    value={contactName}
                    onChangeText={setContactName}
                    hint="Required"
                  />

                  <Field
                    label="Phone Number"
                    placeholder="+91 9876543210"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Summary</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Category</Text>
                    <Text style={styles.summaryValue}>
                     {category}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Title</Text>
                    <Text style={styles.summaryValue}>{title}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Landmark</Text>
                    <Text style={styles.summaryValue}>{landmark}</Text>
                  </View>
                </View>
              
              {error ? (
                <Text
                  style={{
                    color: "#ff6b6b",
                    textAlign: "center",
                    marginTop: 15,
                  }}
                >
                  {error}
                </Text>
              ) : null}
            </>
          )}
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={!canProceed() ||loading}
            style={[
              styles.primaryBtn,
              (!canProceed() || loading) && { opacity: 0.4 },
            ]}
            onPress={handleNext}
          >
              {loading ? (
                <ActivityIndicator color={BG} />
              ) : (
            <Text style={styles.primaryBtnText}>
              {step < 2 ? "Continue" : "Post Found Item"}
            </Text>
              )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: CARD,
  },

  pickerContainer: {
  backgroundColor: "rgba(255,255,255,0.05)",
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.1)",
  marginTop: 8,
  overflow: "hidden",
},

picker: {
  color: "#FFFFFF",
},

  back: {
    color: "#fff",
    fontSize: 24,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  stepText: {
    color: PRIMARY,
    fontWeight: "700",
  },

  stepBar: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 16,
    marginTop: 10,
  },

  stepSegment: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
  },

  stepSegmentActive: {
    backgroundColor: PRIMARY,
  },

  stepSegmentDone: {
    backgroundColor: "rgba(92,225,198,0.4)",
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryChip: {
    width: (width - 70) / 4,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  categoryChipActive: {
    backgroundColor: "rgba(92,225,198,0.12)",
    borderColor: PRIMARY,
  },

  categoryEmoji: {
    fontSize: 22,
  },

  categoryLabel: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  categoryLabelActive: {
    color: PRIMARY,
  },

  fieldWrap: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  label: {
    color: "#aaa",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
  },

  hint: {
    color: AMBER,
    fontSize: 11,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 14,
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

  conditionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  conditionChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  conditionChipActive: {
    borderColor: PRIMARY,
    backgroundColor: "rgba(92,225,198,0.12)",
  },

  conditionText: {
    color: MUTED,
  },

  conditionTextActive: {
    color: PRIMARY,
    fontWeight: "700",
  },

  landmarkContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  landmarkChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  landmarkChipActive: {
    backgroundColor: "rgba(92,225,198,0.12)",
    borderColor: PRIMARY,
  },

  landmarkText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },

  landmarkTextActive: {
    color: PRIMARY,
  },

  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },

  summaryTitle: {
    color: PRIMARY,
    fontWeight: "700",
    marginBottom: 15,
    fontSize: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryKey: {
    color: MUTED,
  },

  summaryValue: {
    color: "#fff",
    fontWeight: "700",
  },

  footer: {
    padding: 16,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: BORDER,
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

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  successEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },

  successTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
  },
});