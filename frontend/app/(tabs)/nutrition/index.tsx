import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalorieSummaryCard } from "@/components/calorie-summary-card";
import { MacrosCard } from "@/components/macros-card";
import { ProteinChart } from "@/components/protein-chart";
import { getWeightEntries, listMeals, type Meal } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const DAILY_CALORIE_GOAL = 2000;
const PROTEIN_PER_KG = 1.5;
const DEFAULT_PROTEIN_GOAL = 120;
const FAT_CALORIE_SHARE = 0.27;
const CARB_CALORIE_SHARE = 0.5;
const CALORIES_PER_GRAM_FAT = 9;
const CALORIES_PER_GRAM_CARB = 4;

function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function NutritionScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bodyWeight, setBodyWeight] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      listMeals(token)
        .then(setMeals)
        .catch(() => setMeals([]));
      getWeightEntries(token)
        .then((entries) => {
          if (entries.length === 0) return;
          setBodyWeight(entries[entries.length - 1].weight);
        })
        .catch(() => {});
    }, [token])
  );

  if (!user) return null;

  const dailyProteinGoal = bodyWeight
    ? Math.round(bodyWeight * PROTEIN_PER_KG)
    : DEFAULT_PROTEIN_GOAL;

  const todaysMeals = meals.filter((m) => isToday(m.logged_at));
  const totalCaloriesToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
    0
  );
  const totalProteinToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.protein_g, 0),
    0
  );
  const totalCarbsToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.carbs_g, 0),
    0
  );
  const totalFatToday = todaysMeals.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.fats_g, 0),
    0
  );

  const carbsGoal = Math.round(
    (totalCaloriesToday * CARB_CALORIE_SHARE) / CALORIES_PER_GRAM_CARB
  );
  const fatGoal = Math.round(
    (totalCaloriesToday * FAT_CALORIE_SHARE) / CALORIES_PER_GRAM_FAT
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Nutrition</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionColumn} onPress={() => router.push("/nutrition/add-meal")}>
            <LinearGradient
              colors={["#DF6847", "#F4A261"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addMealCard}
            >
              <Text style={styles.addMealCardText}>Log a meal</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.actionColumn} onPress={() => {}}>
            <LinearGradient
              colors={["#2563EB", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.setTargetCard}
            >
              <Text style={styles.setTargetCardText}>Set target</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <CalorieSummaryCard
          calories={Math.round(totalCaloriesToday)}
          goal={DAILY_CALORIE_GOAL}
        />

        <MacrosCard
          protein={Math.round(totalProteinToday)}
          proteinGoal={dailyProteinGoal}
          carbs={Math.round(totalCarbsToday)}
          carbsGoal={carbsGoal}
          fat={Math.round(totalFatToday)}
          fatGoal={fatGoal}
        />

        <ProteinChart title="Protein intake" />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  scrollContent: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: "100%", maxWidth: 384, gap: 24, paddingBottom: 128 },
  title: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionColumn: {
    flex: 1,
    flexBasis: 0,
  },
  addMealCard: {
    width: "100%",
    minHeight: 76,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  addMealCardText: { fontSize: 16, fontWeight: "600", color: "#ffffff", textAlign: "center" },
  setTargetCard: {
    width: "100%",
    minHeight: 76,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  setTargetCardText: { fontSize: 16, fontWeight: "600", color: "#ffffff", textAlign: "center" },
});
