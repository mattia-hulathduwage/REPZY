import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Polyline, Stop } from "react-native-svg";
import { listMeals } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ProteinChart({ title }: { title?: string }) {
  const { token } = useAuth();
  const [values, setValues] = useState<number[]>(new Array(7).fill(0));

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;

      listMeals(token)
        .then((meals) => {
          if (cancelled) return;
          const weekStart = startOfWeek(new Date());
          const totals = new Array(7).fill(0);
          for (const meal of meals) {
            const loggedAt = new Date(meal.logged_at);
            for (let i = 0; i < 7; i++) {
              const day = new Date(weekStart);
              day.setDate(day.getDate() + i);
              if (isSameDay(loggedAt, day)) {
                totals[i] += meal.items.reduce((sum, item) => sum + item.protein_g, 0);
              }
            }
          }
          setValues(totals.map((v) => Math.round(v)));
        })
        .catch(() => {
          if (!cancelled) setValues(new Array(7).fill(0));
        });

      return () => {
        cancelled = true;
      };
    }, [token])
  );

  const average = Math.round(
    values.reduce((sum, v) => sum + v, 0) / values.length
  );

  const chartWidth = 280;
  const chartHeight = 90;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const valueToY = (v: number) =>
    chartHeight - ((v - min) / (max - min || 1)) * (chartHeight - 16) - 8;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * chartWidth;
    return { x, y: valueToY(v) };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPolygon = `0,${chartHeight} ${polyline} ${chartWidth},${chartHeight}`;
  const gridLines = [max, Math.round((max + min) / 2), min].map(valueToY);
  const pathLength = points.reduce(
    (len, p, i) => (i === 0 ? 0 : len + Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y)),
    0
  );

  const drawProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    drawProgress.setValue(0);
    Animated.timing(drawProgress, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [polyline, drawProgress]);

  const strokeDashoffset = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [pathLength, 0],
  });
  const areaOpacity = drawProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.average}>{average}g</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{max}g</Text>
          <Text style={styles.axisLabel}>{Math.round((max + min) / 2)}g</Text>
          <Text style={styles.axisLabel}>{min}g</Text>
        </View>
        <Svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={styles.svg}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="proteinAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2563eb" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {gridLines.map((y, i) => (
            <Line
              key={`grid-${i}`}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {points.map((p) => (
            <Line
              key={p.x}
              x1={p.x}
              y1="0"
              x2={p.x}
              y2={chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          <AnimatedPolygon
            points={areaPolygon}
            fill="url(#proteinAreaGradient)"
            stroke="none"
            opacity={areaOpacity}
          />
          <AnimatedPolyline
            points={polyline}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${pathLength},${pathLength}`}
            strokeDashoffset={strokeDashoffset}
          />
          {points.map((p, i) => {
            const frac = i / (points.length - 1 || 1);
            const start = Math.max(0, frac - 0.12);
            const end = Math.max(start + 0.001, frac);
            const dotOpacity = drawProgress.interpolate({
              inputRange: [start, end],
              outputRange: [0, 1],
              extrapolate: "clamp",
            });
            return (
              <AnimatedCircle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" opacity={dotOpacity} />
            );
          })}
        </Svg>
      </View>

      <View style={styles.labelsRow}>
        {WEEK_LABELS.map((label) => (
          <Text key={label} style={styles.axisLabel}>
            {label}
          </Text>
        ))}
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
  title: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 32 },
  statLabel: { fontSize: 12, color: "#9ca3af" },
  average: { marginTop: 4, fontSize: 18, fontWeight: "700", color: "#1d4ed8" },
  chartRow: { marginTop: 16, flexDirection: "row", gap: 8 },
  yAxis: { height: 96, justifyContent: "space-between", paddingVertical: 4 },
  axisLabel: { fontSize: 10, color: "#9ca3af" },
  svg: { height: 96, flex: 1 },
  labelsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 36,
  },
});
