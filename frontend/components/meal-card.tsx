import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ProgressBar } from "@/components/progress-bar";

export function MealCard({
  title,
  calories,
  goal,
  protein,
  proteinGoal,
}: {
  title: string;
  calories: number;
  goal: number;
  protein?: number;
  proteinGoal?: number;
}) {
  const pct = Math.min(100, (calories / goal) * 100);
  const proteinPct =
    protein != null && proteinGoal ? Math.min(100, (protein / proteinGoal) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.menuButton}>
          <Svg viewBox="0 0 24 24" fill="#6b7280" width={16} height={16}>
            <Circle cx="5" cy="12" r="1.6" />
            <Circle cx="12" cy="12" r="1.6" />
            <Circle cx="19" cy="12" r="1.6" />
          </Svg>
        </Pressable>
      </View>

      <View style={styles.caloriesRow}>
        <Text style={styles.metricLabel}>Calories</Text>
        <Text style={styles.metricValue}>
          {calories}kcal / {goal}kcal
        </Text>
      </View>

      <View style={styles.progressSpacing}>
        <ProgressBar pct={pct} />
      </View>

      {protein != null && proteinGoal != null && (
        <>
          <View style={styles.proteinRow}>
            <Text style={styles.metricLabel}>Protein</Text>
            <Text style={styles.metricValue}>
              {protein}g / {proteinGoal}g
            </Text>
          </View>

          <View style={styles.proteinProgressSpacing}>
            <ProgressBar pct={proteinPct} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  menuButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  caloriesRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressSpacing: { marginTop: 12 },
  proteinRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  metricValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  proteinProgressSpacing: { marginTop: 8 },
});
