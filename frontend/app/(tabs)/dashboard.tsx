import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { CaloriesMacrosCard } from "@/components/calories-macros-card";
import { ProteinChart } from "@/components/protein-chart";
import { WeightChart } from "@/components/weight-chart";
import { getTarget, getWeightEntries, listMeals, type Meal } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const DAILY_CALORIE_GOAL = 2000;
const PROTEIN_PER_KG = 1.5;
const DEFAULT_PROTEIN_GOAL = 120;
const FAT_CALORIE_SHARE = 0.27;
const CARB_CALORIE_SHARE = 0.5;
const CALORIES_PER_GRAM_FAT = 9;
const CALORIES_PER_GRAM_CARB = 4;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const [selectedDate] = useState(() => new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bodyWeight, setBodyWeight] = useState<number | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(DAILY_CALORIE_GOAL);
  const [proteinGoalOverride, setProteinGoalOverride] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      listMeals(token)
        .then(setMeals)
        .catch(() => setMeals([]));
      getWeightEntries(token)
        .then((entries) => {
          if (entries.length === 0) return;
          setBodyWeight(entries[entries.length - 1].weight);
        })
        .catch(() => {});
      getTarget(token)
        .then((target) => {
          if (target.calorie_target != null) setCalorieGoal(target.calorie_target);
          if (target.protein_target != null) setProteinGoalOverride(target.protein_target);
        })
        .catch(() => {});
    }, [token])
  );

  if (!user) return null;

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dailyProteinGoal = proteinGoalOverride
    ? proteinGoalOverride
    : bodyWeight
    ? Math.round(bodyWeight * PROTEIN_PER_KG)
    : DEFAULT_PROTEIN_GOAL;

  const todaysMeals = meals.filter((m) => isToday(m.logged_at));
  const totalCaloriesToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
    0
  );
  const totalProteinToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.protein_g, 0),
    0
  );
  const totalCarbsToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.carbs_g, 0),
    0
  );
  const totalFatToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.fats_g, 0),
    0
  );

  const carbsGoal = Math.round(
    (totalCaloriesToday * CARB_CALORIE_SHARE) / CALORIES_PER_GRAM_CARB
  );
  const fatGoal = Math.round(
    (totalCaloriesToday * FAT_CALORIE_SHARE) / CALORIES_PER_GRAM_FAT
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
              <Path
                d="M12 3a5 5 0 0 0-5 5v3.2c0 .7-.25 1.37-.7 1.9L5 15h14l-1.3-1.9a3 3 0 0 1-.7-1.9V8a5 5 0 0 0-5-5ZM10 18a2 2 0 0 0 4 0"
                stroke="#1f2937"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>

        <LinearGradient
          colors={["#df6847", "#f4a261"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.calendarCard}
        >
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.calendarMonth}>
              {format(selectedDate, "MMMM yyyy")}
            </Text>
          </View>

          <View style={styles.weekLabelsRow}>
            {weekDays.map((d) => (
              <Text key={`label-${d.toISOString()}`} style={styles.weekLabel}>
                {format(d, "EEE")}
              </Text>
            ))}
          </View>

          <View style={styles.weekDaysRow}>
            {weekDays.map((d) => {
              const active = isSameDay(d, selectedDate);
              return (
                <View
                  key={d.toISOString()}
                  style={[styles.dayButton, active && styles.dayButtonActive]}
                >
                  <Text
                    style={[styles.dayText, active && styles.dayTextActive]}
                  >
                    {format(d, "d")}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <CaloriesMacrosCard
            calories={Math.round(totalCaloriesToday)}
            calorieGoal={calorieGoal}
            protein={Math.round(totalProteinToday)}
            proteinGoal={dailyProteinGoal}
            carbs={Math.round(totalCarbsToday)}
            carbsGoal={carbsGoal}
            fats={Math.round(totalFatToday)}
            fatsGoal={fatGoal}
          />
        </View>

        <View style={styles.section}>
          <WeightChart title="Weight this year" />
        </View>

        <View style={styles.section}>
          <ProteinChart title="Protein intakes this week" />
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 20, paddingBottom: 128 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { fontSize: 14, color: "#9ca3af" },
  userName: { fontSize: 20, fontWeight: "600", color: "#111827" },
  bellButton: {
    height: 44,
    width: 44,
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
  calendarCard: {
    borderRadius: 24,
    padding: 20,
  },
  calendarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarMonth: { fontSize: 16, fontWeight: "700", color: "#fff" },
  weekLabelsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekLabel: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  weekDaysRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    height: 44,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dayButtonActive: {
    backgroundColor: "#fff",
  },
  dayText: { fontSize: 14, fontWeight: "500", color: "#fff" },
  dayTextActive: { fontWeight: "700", color: "#df6847" },
  section: { gap: 8 },
});
