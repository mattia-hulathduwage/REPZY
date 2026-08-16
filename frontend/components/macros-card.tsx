import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

const GAUGE_SIZE = 78;
const GAUGE_R = 40;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC_FRACTION = 0.75;
const GAUGE_ARC_LEN = GAUGE_C * GAUGE_ARC_FRACTION;
const GAUGE_ROTATE = 135;
const GAUGE_TICKS = Array.from({ length: 28 }, (_, i) => {
  const angle = ((GAUGE_ROTATE + i * 10) * Math.PI) / 180;
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

  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.gaugeWrap}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox="0 0 100 100">
          {GAUGE_TICKS.map((tick) => (
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
            r={GAUGE_R}
            stroke="#e9edf3"
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${GAUGE_ARC_LEN} ${GAUGE_C}`}
            transform={`rotate(${GAUGE_ROTATE} 50 50)`}
          />
          <Circle
            cx="50"
            cy="50"
            r={GAUGE_R}
            stroke={color}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${GAUGE_ARC_LEN * progress} ${GAUGE_C}`}
            transform={`rotate(${GAUGE_ROTATE} 50 50)`}
          />
        </Svg>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
      </View>
      <Text style={styles.value}>{value}g</Text>
      <Text style={styles.subtitle}>/{target}g</Text>
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
          value={fat}
          target={fatGoal}
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
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  row: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
  gaugeWrap: {
    height: GAUGE_SIZE,
    width: GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 15, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 11, color: "#9ca3af", fontWeight: "500" },
});
