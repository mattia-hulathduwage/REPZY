import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoMark } from "@/components/logo-mark";
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <LogoMark size={44} />
          </View>
          <Text style={styles.brand}>FitLedger</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please enter your details.</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput
            placeholder="Full name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={[styles.input, styles.inputSpacing]}
          />

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, styles.inputSpacing]}
          />

          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.inputSpacingLarge]}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [pressed && styles.buttonPressed]}
          >
            <LinearGradient
              colors={["#df6847", "#f4a261"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Creating account…" : "Sign Up"}
              </Text>
            </LinearGradient>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "#e9e9e9",
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
    height: 44,
    width: 44,
    shadowColor: "#df6847",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  brand: {
    marginBottom: 32,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: "#111827",
  },
  title: { fontSize: 30, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#6b7280" },
  form: { flex: 1 },
  error: {
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#dc2626",
    backgroundColor: "rgba(220,38,38,0.08)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.15)",
  },
  input: {
    width: "100%",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputSpacing: { marginBottom: 16 },
  inputSpacingLarge: { marginBottom: 32 },
  button: {
    width: "100%",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#df6847",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  switchLink: { fontWeight: "600", color: "#df6847" },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
  },
});
