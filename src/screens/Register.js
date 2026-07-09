import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { registerUser } from '../services/authServices';

const TEAL = '#63CAB7';
const TEAL_DIM = 'rgba(99,202,183,0.15)';
const BG = '#0B1220';
const CARD = '#111927';
const BORDER = 'rgba(99,202,183,0.18)';

// ── Floating Orb ──────────────────────────────────────────────────────────────
function FloatingOrb({ style, delay = 0, size = 80, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3400 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3400 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  return (
    <Animated.View
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style, { transform: [{ translateY }] }]}
    />
  );
}

// ── Password Strength ─────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#E86C6C' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#E8B66C' };
    if (score === 3) return { level: 3, label: 'Good', color: TEAL };
    return { level: 4, label: 'Strong', color: '#63E8B0' };
  };
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <View style={pw.wrap}>
      <View style={pw.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[pw.bar, { backgroundColor: i <= level ? color : 'rgba(255,255,255,0.1)' }]} />
        ))}
      </View>
      <Text style={[pw.label, { color }]}>{label}</Text>
    </View>
  );
}

const pw = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  bars: { flexDirection: 'row', gap: 5, flex: 1 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, label }) {
  return (
    <TouchableOpacity style={cb.row} onPress={onToggle} activeOpacity={0.75}>
      <View style={[cb.box, checked && cb.boxChecked]}>
        {checked && <View style={cb.tick} />}
      </View>
      <Text style={cb.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const cb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(99,202,183,0.4)',
    backgroundColor: 'rgba(99,202,183,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: { backgroundColor: TEAL, borderColor: TEAL },
  tick: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#0B1220',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  label: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 20, flex: 1 },
});

// ── Input Field ───────────────────────────────────────────────────────────────
function InputField({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType }) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(99,202,183,0.18)', 'rgba(99,202,183,0.75)'],
  });
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputBox, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.22)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
    </View>
  );
}

// ── Steps Indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <View style={styles.dots}>
      {[...Array(total)].map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current && styles.dotActive, i < current && styles.dotDone]}
        />
      ))}
    </View>
  );
}


// ── Register Screen ───────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = personal info, 1 = credentials
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const[loading,setLoading]=useState(false);
  const [error,setError]= useState("");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const goNextStep = () => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    setStep(1);
  };

  const goPrevStep = () => {
    setStep(0);
  };

  const handleRegister = async () => {

    if(
      !fullName ||
      !phone ||
      !email ||
      !password 
      
    ){
      setError("Please fill all fields");
      return;
    }
    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }

    try{
      setLoading(true);
      setError("");
      const user = await registerUser(email,password);
      console.log("Registered user:",user.email);

      navigation.navigate("Login");

    }catch(err){
      console.log(err);
      setError(err.message);
    } finally{
      setLoading(false);

    }
  };

  console.log(registerUser);
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Orbs */}
      <FloatingOrb style={{ top: -60, left: -30 }} size={200} color="rgba(99,202,183,0.08)" delay={200} />
      <FloatingOrb style={{ bottom: 40, right: -50 }} size={170} color="rgba(72,160,200,0.07)" delay={600} />

      {/* Grid */}
      {[...Array(9)].map((_, i) => (
        <View key={i} style={[styles.gridLine, { top: (height / 9) * i }]} />
      ))}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, width: '100%' }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Back */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={step === 1 ? goPrevStep : () => navigation?.goBack()}
            >
              <View style={styles.backArrow} />
              <Text style={styles.backText}>{step === 1 ? 'Back' : 'Back'}</Text>
            </TouchableOpacity>

            {/* Step dots */}
            <StepDots current={step} total={2} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerAccent} />
              <Text style={styles.titleSub}>{step === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}</Text>
              <Text style={styles.title}>{step === 0 ? 'Who are you?' : 'Set Credentials'}</Text>
              <Text style={styles.subtitle}>
                {step === 0
                  ? 'Tell us a little about yourself'
                  : 'Create a secure account to get started'}
              </Text>
            </View>

            {/* Accent line */}
            <View style={styles.accentLine}>
              <View style={styles.accentLineSolid} />
              <View style={styles.accentDot} />
            </View>

            {/* STEP 0 — Personal Info */}
            {step === 0 && (
              <Animated.View style={[styles.form, { transform: [{ translateX: stepAnim }] }]}>
                <InputField
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <InputField
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <InputField
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </Animated.View>
            )}

            {/* STEP 1 — Credentials */}
            {step === 1 && (
              <Animated.View style={[styles.form, { transform: [{ translateX: stepAnim }] }]}>
                <View>
                  <InputField
                    label="Password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <PasswordStrength password={password} />
                </View>
                <InputField
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
                <Checkbox
                  checked={agreed}
                  onToggle={() => setAgreed(!agreed)}
label="I agree to follow the school Lost & Found guidelines and privacy policy"                />
              </Animated.View>
            )}

            {/* CTA */}
            {step === 0 ? (
              <TouchableOpacity
                style={[styles.primaryBtn, (!fullName || !email) && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={goNextStep}
                disabled={!fullName || !email}
              >
                <Text style={styles.primaryBtnText}>Continue →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, (!password || !agreed || password !== confirmPassword) && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={!password || !agreed || password !== confirmPassword}
              >
<Text style={styles.primaryBtnText}>
  {loading ? "Joining..." : "Join CampusConnect"}
</Text>              </TouchableOpacity>
            )}

            {/* Sign in link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  content: {
    width: width * 0.88,
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 28,
    paddingVertical: 36,
  },

  // Back
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backArrow: {
    width: 8, height: 8,
    borderLeftWidth: 2, borderBottomWidth: 2,
    borderColor: TEAL,
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  backText: { color: TEAL, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },

  // Step dots
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)' },
  dotActive: { width: 24, backgroundColor: TEAL },
  dotDone: { backgroundColor: 'rgba(99,202,183,0.45)' },

  // Header
  header: { marginBottom: 6 },
  headerAccent: { width: 36, height: 3, backgroundColor: TEAL, borderRadius: 2, marginBottom: 14 },
  titleSub: { color: 'rgba(99,202,183,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2.5, marginBottom: 4 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.38)', fontSize: 14, lineHeight: 20 },

  // Accent line
  accentLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  accentLineSolid: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  accentDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: TEAL, marginLeft: 10 },

  // Form
  form: { gap: 16, marginBottom: 8 },
  fieldWrap: { gap: 7 },
  label: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600', letterSpacing: 0.8 },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { color: '#FFFFFF', fontSize: 15, fontWeight: '400' },
  errorText: { color: '#E86C6C', fontSize: 12, fontWeight: '500', marginTop: -8 },

  // CTA
  primaryBtn: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: TEAL,
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  primaryBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  primaryBtnText: { color: BG, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  footerLink: { color: TEAL, fontSize: 14, fontWeight: '700' },
});