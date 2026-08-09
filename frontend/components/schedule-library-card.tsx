import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function ScheduleLibraryCard({
  scheduleCount,
  onPress,
}: {
  scheduleCount: number;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
          <Path
            d="M5 4h11a2 2 0 0 1 2 2v14l-7.5-4L5 20V4Z"
            stroke="#1f2937"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>Schedule library</Text>
        <Text style={styles.subtitle}>
          {scheduleCount} saved schedule{scheduleCount === 1 ? "" : "s"}
        </Text>
      </View>

      <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
        <Path
          d="M9 6l6 6-6 6"
          stroke="#9ca3af"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrap: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#e9e9e9",
  },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 13, color: "#6b7280" },
});
