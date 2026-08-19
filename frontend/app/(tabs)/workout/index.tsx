import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      listSchedules(token)
        .then(setSchedules)
        .catch(() => setSchedules([]))
        .finally(() => setSchedulesLoading(false));
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
          </View>

          <TodaysWorkoutCard workoutName="Push day" exerciseCount={TODAYS_EXERCISES.length} />

          {(schedulesLoading || activeSchedule) && (
            <View style={styles.activeScheduleSlot}>
              {activeSchedule && (
                <ActiveScheduleCard
                  scheduleName={activeSchedule.name}
                  workoutDays={activeSchedule.num_days}
                  onPress={() =>
                    router.push(`/workout/schedule-view?id=${activeSchedule.id}&readOnly=1`)
                  }
                />
              )}
            </View>
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
  activeScheduleSlot: { width: "100%", height: 108 },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
