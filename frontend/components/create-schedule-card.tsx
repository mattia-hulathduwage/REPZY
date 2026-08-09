import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export function CreateScheduleCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>Create new schedule</Text>

      <View style={styles.iconWrap}>
        <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
          <Path
            d="M12 5v14M5 12h14"
            stroke="#ea580c"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      </View>
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
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  iconWrap: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#ffedd5",
  },
});
