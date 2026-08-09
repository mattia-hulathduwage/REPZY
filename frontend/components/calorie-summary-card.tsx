import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "@/components/progress-bar";

export function CalorieSummaryCard({
  calories,
  goal,
  protein,
  proteinGoal,
}: {
  calories: number;
  goal: number;
  protein: number;
  proteinGoal: number;
}) {
  const pct = Math.min(100, (calories / goal) * 100);
  const remaining = Math.max(0, goal - calories);
  const proteinPct = Math.min(100, (protein / proteinGoal) * 100);
  const proteinRemaining = Math.max(0, proteinGoal - protein);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Total calories today</Text>

      <View style={styles.calorieRow}>
        <Text style={styles.calorieLabel}>Calories</Text>
        <Text style={styles.calorieValue}>
          {calories}/{goal}kcal
        </Text>
      </View>

      <View style={styles.progressSpacing}>
        <ProgressBar pct={pct} />
      </View>

      <Text style={styles.remaining}>{remaining} kcal remaining</Text>

      <View style={styles.proteinRow}>
        <Text style={styles.proteinLabel}>Protein</Text>
        <Text style={styles.proteinValue}>
          {protein}g / {proteinGoal}g
        </Text>
      </View>

      <View style={styles.proteinProgressSpacing}>
        <ProgressBar pct={proteinPct} />
      </View>

      <Text style={styles.remaining}>{proteinRemaining}g remaining</Text>
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
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  calorieRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calorieLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  calorieValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  progressSpacing: { marginTop: 8 },
  remaining: { marginTop: 16, fontSize: 12, color: "#9ca3af" },
  proteinRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  proteinLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  proteinValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  proteinProgressSpacing: { marginTop: 8 },
});
