import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signup } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SignupScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await signup({ email, password, name });
      setSession(res.access_token, res.user);
      router.replace("/(tabs)/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={["#4a9fe8", "#1a4f9c", "#0a1f4a", "#050b1e", "#000000"]}
      locations={[0, 0.22, 0.45, 0.7, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brand}>FitApp</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please enter your details.</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput
            placeholder="Full name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={name}
            onChangeText={setName}
            style={[styles.input, styles.inputSpacing]}
          />

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, styles.inputSpacing]}
          />

          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.inputSpacingLarge]}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Creating account…" : "Sign Up"}
            </Text>
          </Pressable>

          <Text style={styles.switchText}>
            Already have an account?{" "}
            <Link href="/login" style={styles.switchLink}>
              Log In
            </Link>
          </Text>
        </View>

        <Text style={styles.footer}>Terms of Service | Privacy Policy</Text>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 384,
  },
  header: {
    marginBottom: 40,
    marginTop: 24,
    alignItems: "center",
  },
  logo: {
    marginBottom: 16,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  brand: {
    marginBottom: 32,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: "#fff",
  },
  title: { fontSize: 30, fontWeight: "600", color: "#fff" },
  subtitle: { marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.5)" },
  form: { flex: 1 },
  error: {
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#fca5a5",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  input: {
    width: "100%",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputSpacing: { marginBottom: 16 },
  inputSpacingLarge: { marginBottom: 32 },
  button: {
    width: "100%",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#38bdf8",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#04122e",
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  switchLink: { fontWeight: "600", color: "#fff" },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
});
