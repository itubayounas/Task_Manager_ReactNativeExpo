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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import AnimatedBackground from "../components/AnimatedBackground";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // ✅ Fix 4 — Proper specific validation messages
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Invalid Email", "Please enter a valid email address (e.g. name@gmail.com)");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No account found with this email. Please sign up first.";
      if (error.code === "auth/wrong-password")
        message = "Incorrect password. Please try again.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      if (error.code === "auth/invalid-credential")
        message = "No account found with this email. Please sign up first.";
      if (error.code === "auth/too-many-requests")
        message = "Too many failed attempts. Please try again later.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Fix 2 — Status bar color matches indigo background */}
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
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <View style={{
                width: 72, height: 72,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 36,
                alignItems: "center", justifyContent: "center",
                marginBottom: 12,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.4)",
              }}>
                <Text style={{ color: "white", fontSize: 32 }}>✓</Text>
              </View>
              <Text style={{ color: "white", fontSize: 26, fontWeight: "bold" }}>
                Smart Tasks
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 }}>
                Welcome back! Please login
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

              {/* Email */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#374151", fontWeight: "600", fontSize: 13, marginBottom: 8 }}>
                  Email Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: "#e5e7eb",
                    borderRadius: 12, paddingHorizontal: 16,
                    paddingVertical: 12, backgroundColor: "#f9fafb",
                    color: "#1f2937", fontSize: 15,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  blurOnSubmit={false}
                />
              </View>

              {/* Password */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: "#374151", fontWeight: "600", fontSize: 13, marginBottom: 8 }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: "row", alignItems: "center",
                  borderWidth: 1, borderColor: "#e5e7eb",
                  borderRadius: 12, backgroundColor: "#f9fafb",
                }}>
                  <TextInput
                    style={{
                      flex: 1, paddingHorizontal: 16,
                      paddingVertical: 12, color: "#1f2937", fontSize: 15,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ paddingHorizontal: 16 }}
                  >
                    <Text style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: "#4f46e5",
                  borderRadius: 12, paddingVertical: 15,
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    Login
                  </Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Signup Link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 14, textDecorationLine: "underline" }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}