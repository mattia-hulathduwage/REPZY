import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { changePassword } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user) return null;

  function closePasswordModal() {
    setPasswordModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  }

  async function handleChangePassword() {
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordError(null);
    setIsSavingPassword(true);
    try {
      await changePassword(token, { currentPassword, newPassword });
      closePasswordModal();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Svg viewBox="0 0 24 24" fill="none" width={40} height={40}>
                <Circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.8" />
                <Path
                  d="M4.5 20c1.4-4 4.5-6 7.5-6s6.1 2 7.5 6"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>

          <View style={styles.tileGroup}>
            <Pressable style={styles.tile}>
              <Text style={styles.tileLabel}>Name</Text>
              <View style={styles.tileValueRow}>
                <Text style={styles.tileValue}>{user.name}</Text>
                <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <Path
                    d="M9 6l6 6-6 6"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </Pressable>

            <Pressable style={styles.tile}>
              <Text style={styles.tileLabel}>Email</Text>
              <View style={styles.tileValueRow}>
                <Text style={styles.tileValue}>{user.email}</Text>
                <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <Path
                    d="M9 6l6 6-6 6"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </Pressable>

            <Pressable
              style={[styles.tile, styles.tileLast]}
              onPress={() => setPasswordModalVisible(true)}
            >
              <Text style={styles.tileLabel}>Password</Text>
              <View style={styles.tileValueRow}>
                <Text style={styles.tileValue}>••••••••</Text>
                <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <Path
                    d="M9 6l6 6-6 6"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </Pressable>
          </View>

          <Pressable style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Current password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {passwordError && <Text style={styles.modalError}>{passwordError}</Text>}

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancelButton} onPress={closePasswordModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveButton, isSavingPassword && styles.modalSaveButtonDisabled]}
                onPress={handleChangePassword}
                disabled={isSavingPassword}
              >
                <Text style={styles.modalSaveText}>
                  {isSavingPassword ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 24, paddingBottom: 128 },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  avatarWrap: { alignItems: "center" },
  avatar: {
    height: 96,
    width: 96,
    borderRadius: 999,
    backgroundColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  tileGroup: {
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: "hidden",
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tileLast: { borderBottomWidth: 0 },
  tileLabel: { fontSize: 14, color: "#6b7280" },
  tileValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tileValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  modalInput: {
    borderRadius: 12,
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  modalError: { fontSize: 13, color: "#ef4444" },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e9e9e9",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  modalSaveButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  modalSaveButtonDisabled: { opacity: 0.6 },
  modalSaveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  logoutButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fef2f2",
  },
  logoutText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
});
