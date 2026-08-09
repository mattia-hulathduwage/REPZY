import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Body, { type Slug } from "react-native-body-highlighter";
import { EXERCISES_BY_MUSCLE, type MuscleKey } from "@/lib/muscle-exercises";

const MUSCLE_GROUPS: { key: MuscleKey; label: string; slug: Slug }[] = [
  { key: "chest", label: "Chest", slug: "chest" },
  { key: "bicep", label: "Bicep", slug: "biceps" },
  { key: "tricep", label: "Tricep", slug: "triceps" },
  { key: "legs", label: "Quads", slug: "quadriceps" },
  { key: "shoulders", label: "Shoulders", slug: "deltoids" },
  { key: "abs", label: "Abs", slug: "abs" },
  { key: "calfs", label: "Calfs", slug: "calves" },
  { key: "forearms", label: "Forearms", slug: "forearm" },
  { key: "hamstring", label: "Hamstring", slug: "hamstring" },
  { key: "trapezius", label: "Trap", slug: "trapezius" },
  { key: "upperBack", label: "Upper back", slug: "upper-back" },
  { key: "lowerBack", label: "Lower back", slug: "lower-back" },
];

const BACK_ONLY_KEYS: MuscleKey[] = ["tricep", "hamstring", "trapezius", "upperBack", "lowerBack"];

const SLUG_TO_KEY: Record<string, MuscleKey> = Object.fromEntries(
  MUSCLE_GROUPS.map((m) => [m.slug, m.key])
);

const HIGHLIGHT = "#df6847";

export default function MuscleAnatomyScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<MuscleKey | null>(null);

  const selectedSlug = selected ? MUSCLE_GROUPS.find((m) => m.key === selected)?.slug : undefined;
  const side: "front" | "back" = selected && BACK_ONLY_KEYS.includes(selected) ? "back" : "front";
  const exerciseGroups = selected ? EXERCISES_BY_MUSCLE[selected] : [];

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
            <Text style={styles.title}>Muscle anatomy</Text>
          </View>

          <View style={styles.tagRow}>
            {MUSCLE_GROUPS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setSelected(m.key)}
                style={[styles.tag, selected === m.key && styles.tagActive]}
              >
                <Text style={[styles.tagText, selected === m.key && styles.tagTextActive]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.bodyCard}>
            <Body
              data={selectedSlug ? [{ slug: selectedSlug, color: HIGHLIGHT }] : []}
              onBodyPartPress={(part) => {
                const key = part.slug ? SLUG_TO_KEY[part.slug] : undefined;
                if (key) setSelected(key);
              }}
              colors={[HIGHLIGHT]}
              side={side}
              gender="male"
              scale={0.8}
              border="#111827"
              defaultFill="#f4f4f5"
            />
          </View>

          <View style={styles.exercisesCard}>
            <Text style={styles.exercisesTitle}>
              {selected
                ? `${MUSCLE_GROUPS.find((m) => m.key === selected)?.label} exercises`
                : "Exercises"}
            </Text>

            {!selected && (
              <Text style={styles.emptyText}>Select a muscle group to see exercises</Text>
            )}

            {selected && exerciseGroups.length === 0 && (
              <Text style={styles.emptyText}>No exercises added yet</Text>
            )}

            {exerciseGroups.map((group, i) => (
              <View key={group.region ?? i} style={styles.exerciseGroup}>
                {group.region && <Text style={styles.regionLabel}>{group.region}</Text>}
                {group.exercises.map((exercise) => (
                  <View key={exercise.name} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.isBest && <Text style={styles.bestBadge}>⭐ Best</Text>}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 20, paddingBottom: 128 },
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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  tagActive: { backgroundColor: "#df6847" },
  tagText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  tagTextActive: { color: "#fff" },
  bodyCard: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  exercisesCard: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  exercisesTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  emptyText: { fontSize: 13, color: "#9ca3af" },
  exerciseGroup: { gap: 8 },
  regionLabel: { fontSize: 13, fontWeight: "600", color: "#df6847" },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  exerciseName: { flex: 1, fontSize: 13, color: "#111827" },
  bestBadge: { fontSize: 12, fontWeight: "600", color: "#b45309" },
});
