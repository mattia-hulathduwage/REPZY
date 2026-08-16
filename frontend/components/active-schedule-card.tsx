import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function ActiveScheduleCard({
  scheduleName,
  workoutDays,
}: {
  scheduleName: string;
  workoutDays: number;
}) {
  return (
    <LinearGradient
      colors={["#3b82f6", "#38bdf8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Active schedule</Text>
        <View style={styles.countRow}>
          <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
            <Path
              d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.countText}>
            {workoutDays} day{workoutDays === 1 ? "" : "s"}/week
          </Text>
        </View>
      </View>
      <Text style={styles.scheduleName} numberOfLines={1}>
        {scheduleName}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 108,
    borderRadius: 24,
    padding: 20,
    justifyContent: "center",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#fff" },
  scheduleName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
