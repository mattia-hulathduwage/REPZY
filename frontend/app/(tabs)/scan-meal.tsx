import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

export default function ScanMealScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Meal scanning</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Svg viewBox="0 0 24 24" fill="none" width={56} height={56}>
            <Path
              d="M4 8V5.5C4 4.67 4.67 4 5.5 4H8M16 4h2.5c.83 0 1.5.67 1.5 1.5V8M20 16v2.5c0 .83-.67 1.5-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
              stroke="#df6847"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Rect x="9" y="9" width="6" height="6" rx="1" stroke="#df6847" strokeWidth="1.8" />
          </Svg>
        </View>
        <Text style={styles.heading}>Meal scanning is coming soon</Text>
        <Text style={styles.subtext}>
          Point your camera at a meal to log it instantly. We're still cooking this feature — check
          back soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 96,
    gap: 16,
  },
  iconWrap: {
    height: 112,
    width: 112,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  heading: { fontSize: 18, fontWeight: "600", color: "#111827", textAlign: "center" },
  subtext: { fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 19 },
});
