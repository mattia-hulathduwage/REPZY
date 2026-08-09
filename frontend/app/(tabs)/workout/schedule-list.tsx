import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  activateSchedule,
  deleteSchedule,
  listSchedules,
  type WorkoutScheduleSummary,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ScheduleListScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [schedules, setSchedules] = useState<WorkoutScheduleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    listSchedules(token)
      .then(setSchedules)
      .catch(() => setSchedules([]))
      .finally(() => setIsLoading(false));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleActivate(id: string) {
    if (!token) return;
    const previous = schedules;
    setSchedules((prev) => prev.map((s) => ({ ...s, is_active: s.id === id })));
    try {
      await activateSchedule(token, id);
    } catch {
      setSchedules(previous);
    }
  }

  function handleDelete(id: string) {
    Alert.alert("Delete schedule", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          try {
            await deleteSchedule(token, id);
            load();
          } catch {
            // ignore
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <Path
                  d="M15 6l-6 6 6 6"
                  stroke="#1f2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
            <Text style={styles.title}>Schedule library</Text>
          </View>

          {isLoading && (
            <View style={styles.centerContent}>
              <ActivityIndicator color="#df6847" />
            </View>
          )}

          {!isLoading && schedules.length === 0 && (
            <Text style={styles.emptyText}>No saved schedules yet</Text>
          )}

          {schedules.map((schedule) => (
            <View key={schedule.id} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{schedule.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {schedule.num_days} day{schedule.num_days === 1 ? "" : "s"}/week
                  </Text>
                </View>
                <Switch
                  value={schedule.is_active}
                  onValueChange={() => handleActivate(schedule.id)}
                  disabled={schedule.is_active}
                  trackColor={{ true: "#34C759", false: "#e5e7eb" }}
                />
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/workout/create-schedule?id=${schedule.id}`)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/workout/schedule-view?id=${schedule.id}`)}
                >
                  <Text style={styles.actionText}>View</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(schedule.id)}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 16, paddingBottom: 128 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  emptyText: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 24 },
  centerContent: { marginTop: 24, alignItems: "center", justifyContent: "center" },
  card: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardSubtitle: { marginTop: 2, fontSize: 13, color: "#6b7280" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#e9e9e9",
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  deleteButton: { backgroundColor: "#fef2f2" },
  deleteText: { color: "#ef4444" },
});
