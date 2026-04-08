import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import AnimatedBackground from "../components/AnimatedBackground";

// ✅ THE FIX — InputField is defined OUTSIDE the component
// When defined inside, React treats it as a NEW component on every
// keystroke → unmounts old input → mounts new one → keyboard dismisses
// When defined outside, it's always the same component → keyboard stays open
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightElement,
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{
      color: "#374151",
      fontWeight: "600",
      fontSize: 13,
      marginBottom: 8,
    }}>
      {label}
    </Text>
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 12,
      backgroundColor: "#f9fafb",
    }}>
      <TextInput
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: "#1f2937",
          fontSize: 15,
        }}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        value={value}
        onChangeText={onChangeText}
        blurOnSubmit={false}
      />
      {rightElement}
    </View>
  </View>
);

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Invalid Email", "Please enter a valid email (e.g. name@gmail.com)");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter a password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }
    if (!confirmPassword) {
      Alert.alert("Missing Confirmation", "Please confirm your password");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Your passwords do not match. Please try again");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(userCredential.user, { displayName: name.trim() });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/email-already-in-use")
        message = "An account with this email already exists. Please login instead.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address";
      if (error.code === "auth/weak-password")
        message = "Password is too weak. Use at least 6 characters";
      Alert.alert("Signup Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Status bar matches indigo background */}
      <StatusBar backgroundColor="#4f46e5" barStyle="light-content" translucent={false} />

      <AnimatedBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="none"
          >

            {/* Logo */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={{
                width: 72, height: 72,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 36,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.4)",
              }}>
                <Text style={{ color: "white", fontSize: 32 }}>✓</Text>
              </View>
              <Text style={{ color: "white", fontSize: 26, fontWeight: "bold" }}>
                Planora
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 }}>
                Create your account
              </Text>
            </View>

            {/* Form Card */}
            <View style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            }}>

              <InputField
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />

              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                secureTextEntry={!showPassword}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ paddingHorizontal: 16 }}
                  >
                    <Text style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                }
              />

              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry={!showConfirmPassword}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ paddingHorizontal: 16 }}
                  >
                    <Text style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                }
              />

              {/* Signup Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading}
                style={{
                  backgroundColor: "#4f46e5",
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: "center",
                  marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Login Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 14, textDecorationLine: "underline" }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}