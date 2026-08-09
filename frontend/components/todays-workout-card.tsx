import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function TodaysWorkoutCard({
  workoutName,
  exerciseCount,
  onStart,
}: {
  workoutName: string;
  exerciseCount: number;
  onStart?: () => void;
}) {
  const totalMinutes = exerciseCount * (1 + 3);

  return (
    <LinearGradient
      colors={["#f97316", "#facc15"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View>
        <Text style={styles.title}>Training today</Text>
        <Text style={styles.workoutName}>{workoutName}</Text>
        <View style={styles.countRow}>
          <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
            <Path
              d="M6.5 8.5v7M2.5 10v4M17.5 8.5v7M21.5 10v4M6.5 12h11"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.countText}>{exerciseCount}</Text>

          <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
            <Path
              d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3.5 2"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.countText}>{totalMinutes}m</Text>
        </View>
      </View>

      <Pressable style={styles.startButton} onPress={onStart}>
        <Svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
          <Path d="M7 5v14l11-7z" fill="#111827" />
        </Svg>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#fff" },
  workoutName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  countRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  startText: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
