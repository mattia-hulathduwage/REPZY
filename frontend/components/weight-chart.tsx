import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Polyline, Stop } from "react-native-svg";
import { getWeightEntries } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function latestPerMonth(
  entries: { date: string; weight: number }[]
): { date: string; weight: number }[] {
  const byMonth = new Map<string, { date: string; weight: number }>();
  for (const entry of entries) {
    const monthKey = entry.date.slice(0, 7);
    const existing = byMonth.get(monthKey);
    if (!existing || entry.date >= existing.date) {
      byMonth.set(monthKey, entry);
    }
  }
  return Array.from(byMonth.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function WeightChart() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<{ date: string; weight: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;

      getWeightEntries(token)
        .then((data) => {
          if (cancelled) return;
          setEntries(
            latestPerMonth(data.map((e) => ({ date: e.recorded_date, weight: e.weight })))
          );
        })
        .catch(() => {
          if (!cancelled) setEntries([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [token])
  );

  const chartWidth = 280;
  const chartHeight = 90;
  const values = entries.map((e) => e.weight);
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const valueToY = (v: number) =>
    chartHeight - ((v - min) / (max - min || 1)) * (chartHeight - 16) - 8;
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1 || 1)) * chartWidth,
    y: valueToY(v),
  }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
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

  if (isLoading) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <ActivityIndicator color="#df6847" />
      </View>
    );
  }

  const hasData = entries.length > 0;
  const labels = entries.map((e) => format(new Date(e.date), "MMM"));
  const average = hasData
    ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
    : 0;
  const difference = hasData
    ? Math.round((values[values.length - 1] - values[0]) * 10) / 10
    : 0;
  const areaPolygon = `0,${chartHeight} ${polyline} ${chartWidth},${chartHeight}`;
  const gridLines = hasData
    ? [max, (max + min) / 2, min].map(valueToY)
    : [chartHeight * 0.15, chartHeight * 0.5, chartHeight * 0.85];

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
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.average}>{average}kg</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Difference</Text>
          <Text style={[styles.difference, difference > 0 && styles.differencePositive]}>
            {difference > 0 ? "+" : ""}
            {difference}kg
          </Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{hasData ? `${max}kg` : ""}</Text>
          <Text style={styles.axisLabel}>
            {hasData ? `${Math.round(((max + min) / 2) * 10) / 10}kg` : ""}
          </Text>
          <Text style={styles.axisLabel}>{hasData ? `${min}kg` : ""}</Text>
        </View>
        <Svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={styles.svg}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22c55e" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#22c55e" stopOpacity="0" />
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
            fill="url(#weightAreaGradient)"
            stroke="none"
            opacity={areaOpacity}
          />
          <AnimatedPolyline
            points={polyline}
            fill="none"
            stroke="#22c55e"
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
              <AnimatedCircle key={i} cx={p.x} cy={p.y} r="3" fill="#22c55e" opacity={dotOpacity} />
            );
          })}
        </Svg>
      </View>

      <View style={styles.labelsRow}>
        {labels.map((label, i) => (
          <Text key={`${label}-${i}`} style={styles.axisLabel}>
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
  centerContent: { minHeight: 120, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 32 },
  statLabel: { fontSize: 12, color: "#9ca3af" },
  average: { marginTop: 4, fontSize: 18, fontWeight: "700", color: "#1d4ed8" },
  difference: { marginTop: 4, fontSize: 18, fontWeight: "700", color: "#be583c" },
  differencePositive: { color: "#ef4444" },
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
