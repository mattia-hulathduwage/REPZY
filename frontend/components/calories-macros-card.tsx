import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

const GOAL_GAUGE_SIZE = 56;
const GOAL_GAUGE_R = 40;
const GOAL_GAUGE_C = 2 * Math.PI * GOAL_GAUGE_R;
const GOAL_GAUGE_ARC_FRACTION = 0.75;
const GOAL_GAUGE_ARC_LEN = GOAL_GAUGE_C * GOAL_GAUGE_ARC_FRACTION;
const GOAL_GAUGE_ROTATE = 135;

const MACRO_GAUGE_SIZE = 58;
const MACRO_GAUGE_R = 40;
const MACRO_GAUGE_C = 2 * Math.PI * MACRO_GAUGE_R;
const MACRO_GAUGE_ARC_FRACTION = 0.75;
const MACRO_GAUGE_ARC_LEN = MACRO_GAUGE_C * MACRO_GAUGE_ARC_FRACTION;
const MACRO_GAUGE_ROTATE = 135;
const MACRO_GAUGE_TICKS = Array.from({ length: 28 }, (_, i) => {
  const angle = ((MACRO_GAUGE_ROTATE + i * 10) * Math.PI) / 180;
  return {
    key: i,
    x1: 50 + 46 * Math.cos(angle),
    y1: 50 + 46 * Math.sin(angle),
    x2: 50 + 50 * Math.cos(angle),
    y2: 50 + 50 * Math.sin(angle),
  };
});

function MacroGauge({
  label,
  value,
  target,
  color,
  icon,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  const progress = target > 0 ? Math.min(1, value / target) : 0;
  const isOver = target > 0 && value >= target;
  const diff = isOver ? value - target : target - value;

  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroValue}>{Math.max(0, Math.round(diff))}g</Text>
      <View style={styles.macroGaugeWrap}>
        <Svg width={MACRO_GAUGE_SIZE} height={MACRO_GAUGE_SIZE} viewBox="0 0 100 100">
          {MACRO_GAUGE_TICKS.map((tick) => (
            <Line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="#e5e9f0"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
          <Circle
            cx="50"
            cy="50"
            r={MACRO_GAUGE_R}
            stroke="#e9edf3"
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${MACRO_GAUGE_ARC_LEN} ${MACRO_GAUGE_C}`}
            transform={`rotate(${MACRO_GAUGE_ROTATE} 50 50)`}
          />
          <Circle
            cx="50"
            cy="50"
            r={MACRO_GAUGE_R}
            stroke={color}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${MACRO_GAUGE_ARC_LEN * progress} ${MACRO_GAUGE_C}`}
            transform={`rotate(${MACRO_GAUGE_ROTATE} 50 50)`}
          />
        </Svg>
        <View style={styles.macroGaugeIcon}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
      </View>
      <Text style={styles.macroLabel}>
        {label} {isOver ? "over" : "left"}
      </Text>
    </View>
  );
}

export function CaloriesMacrosCard({
  calories,
  calorieGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fats,
  fatsGoal,
}: {
  calories: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fats: number;
  fatsGoal: number;
}) {
  const progress = calorieGoal > 0 ? Math.min(1, calories / calorieGoal) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.goalLabel}>Today's Goal</Text>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieValue}>{calories}</Text>
            <Text style={styles.calorieGoal}>/{calorieGoal}</Text>
          </View>
        </View>

        <View style={styles.goalGaugeWrap}>
          <Svg width={GOAL_GAUGE_SIZE} height={GOAL_GAUGE_SIZE} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r={GOAL_GAUGE_R}
              stroke="#e9edf3"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${GOAL_GAUGE_ARC_LEN} ${GOAL_GAUGE_C}`}
              transform={`rotate(${GOAL_GAUGE_ROTATE} 50 50)`}
            />
            <Circle
              cx="50"
              cy="50"
              r={GOAL_GAUGE_R}
              stroke="#111827"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${GOAL_GAUGE_ARC_LEN * progress} ${GOAL_GAUGE_C}`}
              transform={`rotate(${GOAL_GAUGE_ROTATE} 50 50)`}
            />
          </Svg>
          <View style={styles.goalGaugeIcon}>
            <MaterialCommunityIcons name="fire" size={18} color="#111827" />
          </View>
        </View>
      </View>

      <View style={styles.macroRow}>
        <MacroGauge
          label="Protein"
          value={protein}
          target={proteinGoal}
          color="#df6847"
          icon="egg-fried"
        />
        <MacroGauge
          label="Carbs"
          value={carbs}
          target={carbsGoal}
          color="#8b5cf6"
          icon="barley"
        />
        <MacroGauge
          label="Fat"
          value={fats}
          target={fatsGoal}
          color="#16a34a"
          icon="water-percent"
        />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  goalLabel: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  calorieRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  calorieValue: { fontSize: 32, fontWeight: "800", color: "#111827" },
  calorieGoal: { fontSize: 16, fontWeight: "600", color: "#9ca3af" },
  goalGaugeWrap: {
    height: GOAL_GAUGE_SIZE,
    width: GOAL_GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  goalGaugeIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  macroRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  macroCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#f5f6f8",
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  macroValue: { fontSize: 14, fontWeight: "800", color: "#111827" },
  macroGaugeWrap: {
    height: MACRO_GAUGE_SIZE,
    width: MACRO_GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  macroGaugeIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  macroLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "600", textAlign: "center" },
});
