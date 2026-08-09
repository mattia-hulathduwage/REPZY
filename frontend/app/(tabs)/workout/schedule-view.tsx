import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { getSchedule, type WorkoutSchedule } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ScheduleViewScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [schedule, setSchedule] = useState<WorkoutSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || typeof id !== "string") return;
    setIsLoading(true);
    getSchedule(token, id)
      .then(setSchedule)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load schedule"))
      .finally(() => setIsLoading(false));
  }, [token, id]);

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
            <Text style={styles.title}>{schedule?.name ?? "Schedule"}</Text>
          </View>

          {isLoading && (
            <View style={styles.centerContent}>
              <ActivityIndicator color="#df6847" />
            </View>
          )}

          {!isLoading && error && <Text style={styles.emptyText}>{error}</Text>}

          {!isLoading && schedule && (
            <>
              <Text style={styles.subtitle}>
                {schedule.num_days} day{schedule.num_days === 1 ? "" : "s"}/week
                {schedule.is_active ? " · Active" : ""}
              </Text>

              {schedule.days.map((day) => (
                <View key={day.id} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>{day.day_label ?? `Day ${day.day_number}`}</Text>

                  {day.is_rest ? (
                    <Text style={styles.restText}>Rest day</Text>
                  ) : day.exercises.length === 0 ? (
                    <Text style={styles.restText}>No exercises added</Text>
                  ) : (
                    day.exercises.map((e) => (
                      <View key={e.id} style={styles.exerciseRow}>
                        <Text style={styles.exerciseName}>{e.exercise_name}</Text>
                        <Text style={styles.exerciseDetail}>
                          {[
                            e.sets != null ? `${e.sets} sets` : null,
                            e.reps ? `${e.reps} reps` : null,
                            e.weight != null ? `${e.weight}kg` : null,
                            e.rest_seconds != null ? `${e.rest_seconds}s rest` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              ))}

              <Pressable
                style={styles.editButton}
                onPress={() => router.push(`/workout/create-schedule?id=${schedule.id}`)}
              >
                <Text style={styles.editButtonText}>Edit schedule</Text>
              </Pressable>
            </>
          )}
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
  subtitle: { fontSize: 13, color: "#6b7280" },
  emptyText: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 24 },
  centerContent: { marginTop: 24, alignItems: "center", justifyContent: "center" },
  dayCard: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dayLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  restText: { fontSize: 13, color: "#9ca3af" },
  exerciseRow: {
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    padding: 10,
    gap: 2,
  },
  exerciseName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  exerciseDetail: { fontSize: 12, color: "#6b7280" },
  editButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  editButtonText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
