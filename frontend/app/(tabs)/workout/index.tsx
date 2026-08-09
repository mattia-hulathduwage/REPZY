import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ActiveScheduleCard } from "@/components/active-schedule-card";
import { CreateScheduleCard } from "@/components/create-schedule-card";
import { MuscleAnatomyCard } from "@/components/muscle-anatomy-card";
import { ScheduleLibraryCard } from "@/components/schedule-library-card";
import { TodaysWorkoutCard } from "@/components/todays-workout-card";
import { listSchedules, type WorkoutScheduleSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const TODAYS_EXERCISES = ["Push-up", "Muscle up"];

export default function WorkoutScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<WorkoutScheduleSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      listSchedules(token)
        .then(setSchedules)
        .catch(() => setSchedules([]));
    }, [token])
  );

  if (!user) return null;

  const activeSchedule = schedules.find((s) => s.is_active);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Workout</Text>
            <Pressable style={styles.addButton}>
              <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <Path
                  d="M12 5v14M5 12h14"
                  stroke="#1f2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>

          <TodaysWorkoutCard workoutName="Push day" exerciseCount={TODAYS_EXERCISES.length} />

          {activeSchedule && (
            <ActiveScheduleCard
              scheduleName={activeSchedule.name}
              workoutDays={activeSchedule.num_days}
            />
          )}

          <ScheduleLibraryCard
            scheduleCount={schedules.length}
            onPress={() => router.push("/workout/schedule-list")}
          />

          <CreateScheduleCard onPress={() => router.push("/workout/create-schedule")} />

          <MuscleAnatomyCard onPress={() => router.push("/workout/muscle-anatomy")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 24, paddingBottom: 128 },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
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
});
