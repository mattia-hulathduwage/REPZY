import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Path, Polygon } from "react-native-svg";

const BMI_MIN = 15;
const BMI_MAX = 35;

const GAUGE_COLORS = ["#2dd4bf", "#f59e0b", "#8a3324", "#e11d48"];

const CX = 130;
const CY = 150;
const RADIUS = 105;
const STROKE_WIDTH = 22;
const VIEW_W = 260;
const VIEW_H = 165;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function segmentPath(pStart: number, pEnd: number) {
  const angleStart = 180 - pStart * 180;
  const angleEnd = 180 - pEnd * 180;
  const start = polarToCartesian(CX, CY, RADIUS, angleStart);
  const end = polarToCartesian(CX, CY, RADIUS, angleEnd);
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function BmiCard({
  weightKg,
  heightCm,
}: {
  weightKg: number;
  heightCm: number;
}) {
  const heightM = heightCm / 100;
  const bmi = weightKg > 0 && heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const category = getBmiCategory(bmi);
  const pointerPct = Math.min(
    1,
    Math.max(0, (bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)),
  );

  const pointerAngle = 180 - pointerPct * 180;
  const pointerPos = polarToCartesian(
    CX,
    CY,
    RADIUS + STROKE_WIDTH / 2 + 12,
    pointerAngle,
  );
  const pointerRotation = 90 - pointerAngle;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your BMI</Text>

      <View style={styles.gaugeWrap}>
        <Svg width="100%" height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          {GAUGE_COLORS.map((color, i) => (
            <Path
              key={color}
              d={segmentPath(i / GAUGE_COLORS.length, (i + 1) / GAUGE_COLORS.length)}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
          ))}
          <G transform={`translate(${pointerPos.x} ${pointerPos.y}) rotate(${pointerRotation})`}>
            <Polygon points="-7,-14 7,-14 0,0" fill="#111827" />
          </G>
        </Svg>

        <View style={styles.valueWrap}>
          <Text style={styles.value}>{bmi.toFixed(1)}</Text>
          <Text style={styles.label}>BMI</Text>
        </View>
      </View>

      <Text style={styles.category}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { alignSelf: "flex-start", fontSize: 14, fontWeight: "600", color: "#6b7280" },
  gaugeWrap: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  valueWrap: {
    position: "absolute",
    top: "58%",
    alignItems: "center",
  },
  value: { fontSize: 34, fontWeight: "800", color: "#111827" },
  label: { marginTop: 2, fontSize: 12, fontWeight: "600", color: "#6b7280" },
  category: { marginTop: 4, fontSize: 13, fontWeight: "600", color: "#6b7280" },
});
