import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export function ActiveScheduleCard({
  scheduleName,
  workoutDays,
  onPress,
}: {
  scheduleName: string;
  workoutDays: number;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
    <LinearGradient
      colors={["#3b82f6", "#38bdf8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.textWrap}>
        <Text style={styles.title}>Active schedule</Text>
        <Text style={styles.scheduleName} numberOfLines={1}>
          {scheduleName}
        </Text>
        <Text style={styles.countText}>
          {workoutDays} day{workoutDays === 1 ? "" : "s"}/week
        </Text>
      </View>

      <View style={styles.iconWrap}>
        <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
          <Path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
            stroke="#3b82f6"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="12" r="3" stroke="#3b82f6" strokeWidth="1.8" />
        </Svg>
      </View>
    </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 108,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textWrap: { flex: 1, gap: 4, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#fff" },
  scheduleName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  countText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  iconWrap: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#dbeafe",
  },
});
