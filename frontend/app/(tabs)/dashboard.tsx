import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { MealCard } from "@/components/meal-card";
import { ProteinChart } from "@/components/protein-chart";
import { WeightChart } from "@/components/weight-chart";
import { useAuth } from "@/lib/auth-context";

const CALORIES_EATEN = 456;
const CALORIE_GOAL = 512;
const STEP_COUNT = 5234;
const WATER_GLASSES = 12;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  if (!user) return null;

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
                <Pressable
                  key={d.toISOString()}
                  onPress={() => setSelectedDate(d)}
                  style={[styles.dayButton, active && styles.dayButtonActive]}
                >
                  <Text
                    style={[styles.dayText, active && styles.dayTextActive]}
                  >
                    {format(d, "d")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        <MealCard title="Breakfast" calories={CALORIES_EATEN} goal={CALORIE_GOAL} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View>
              <Text style={styles.statLabel}>Step to walk</Text>
              <Text style={styles.statValue}>
                {STEP_COUNT.toLocaleString()}{" "}
                <Text style={styles.statUnit}>step</Text>
              </Text>
            </View>
            <View style={[styles.statIcon, styles.statIconLime]}>
              <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <Circle cx="13" cy="4" r="1.8" fill="#be583c" />
                <Path
                  d="M11 8l-1 4 2 2v6M13 8l3 3-1 4M9 22l2-4"
                  stroke="#be583c"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          <View style={styles.statCard}>
            <View>
              <Text style={styles.statLabel}>Drink water</Text>
              <Text style={styles.statValue}>
                {WATER_GLASSES} <Text style={styles.statUnit}>glass</Text>
              </Text>
            </View>
            <View style={[styles.statIcon, styles.statIconSky]}>
              <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <Path
                  d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z"
                  stroke="#0284c7"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Weight this year</Text>
          <WeightChart />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Protein intakes this week</Text>
          <ProteinChart />
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
  statsRow: { flexDirection: "row", gap: 16 },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statLabel: { fontSize: 12, color: "#9ca3af" },
  statValue: { marginTop: 8, fontSize: 18, fontWeight: "700", color: "#111827" },
  statUnit: { fontSize: 12, fontWeight: "400", color: "#9ca3af" },
  statIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  statIconLime: { backgroundColor: "#fae8e3" },
  statIconSky: { backgroundColor: "#e0f2fe" },
  section: { gap: 8 },
  sectionLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
});
