import { StyleSheet, Text, View } from "react-native";

const BAR_HEIGHT = 96;

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;

  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { height: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.value}>
        {value}/{target}g
      </Text>
    </View>
  );
}

export function MacrosCard({
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
}: {
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Macros today</Text>
      <View style={styles.row}>
        <MacroBar label="Protein" value={protein} target={proteinGoal} color="#7fa7b8" />
        <MacroBar label="Carbs" value={carbs} target={carbsGoal} color="#d9c94a" />
        <MacroBar label="Fat" value={fat} target={fatGoal} color="#e8917a" />
      </View>
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
  row: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  track: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    width: "100%",
    borderRadius: 16,
  },
  value: { fontSize: 12, fontWeight: "500", color: "#374151" },
});
