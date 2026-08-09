import { useAssets } from "expo-asset";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { MealType } from "@/lib/api";

const MEAL_TYPES: { type: MealType; label: string; icon: string; background?: number }[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z",
    background: require("@/assets/meal-tiles/breakfast.png"),
  },
  { 
    type: "lunch",
    label: "Lunch",
    icon: "M6 3v7a3 3 0 0 0 3 3v8M6 3v7M9 3v7M18 3c-2 2-2 5-2 7 0 1.5 1 2 2 2v9",
    background: require("@/assets/meal-tiles/lunch.jpg"),},
  { type: "dinner",
    label: "Dinner",
    icon: "M4 11.5 12 4l8 7.5M6 10v9h12v-9",
    background: require("@/assets/meal-tiles/dinner.jpg"),},
  { type: "snack",
    label: "Snack",
    icon: "M12 5v14M5 12h14",
    background: require("@/assets/meal-tiles/snack.jpg"),
  },
];

const TILE_BACKGROUNDS = MEAL_TYPES.map((m) => m.background).filter(
  (bg): bg is number => bg != null
);

export default function AddMealScreen() {
  const router = useRouter();
  useAssets(TILE_BACKGROUNDS);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <Path
                  d="M15 6l-6 6 6 6"
                  stroke="#1f2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
            <Text style={styles.title}>Add meal</Text>
          </View>

          <Text style={styles.subtitle}>What meal are you logging?</Text>

          <View style={styles.grid}>
            {MEAL_TYPES.map((m) => {
              const content = (
                <>
                  <View style={[styles.tileIcon, !!m.background && styles.tileIconOnImage]}>
                    <Svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
                      <Path
                        d={m.icon}
                        stroke="#ea580c"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={[styles.tileLabel, !!m.background && styles.tileLabelOnImage]}>
                    {m.label}
                  </Text>
                  <Svg viewBox="0 0 24 24" fill="none" width={18} height={18} style={styles.tileChevron}>
                    <Path
                      d="M9 6l6 6-6 6"
                      stroke={m.background ? "#fff" : "#9ca3af"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </>
              );

              if (m.background) {
                return (
                  <Pressable
                    key={m.type}
                    style={[styles.tile, styles.tileImageWrap]}
                    onPress={() => router.push(`/nutrition/add-meal-items?type=${m.type}`)}
                  >
                    <Image source={m.background} resizeMode="cover" style={styles.tileImage} />
                    <LinearGradient
                      colors={["rgba(0, 0, 0, 0.74)", "rgba(0, 0, 0, 0.4)", "rgba(0,0,0,0.1)"]}
                      locations={[0, 0.45, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tileOverlay}
                    />
                    <View style={styles.tileRow}>{content}</View>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={m.type}
                  style={styles.tile}
                  onPress={() => router.push(`/nutrition/add-meal-items?type=${m.type}`)}
                >
                  <View style={styles.tileRow}>{content}</View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 24, paddingBottom: 128 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  grid: {
    gap: 16,
  },
  tile: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tileImageWrap: {
    overflow: "hidden",
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tileIcon: {
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#ffedd5",
  },
  tileIconOnImage: {
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  tileLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111827" },
  tileLabelOnImage: { color: "#fff" },
  tileChevron: { marginLeft: "auto" },
});
