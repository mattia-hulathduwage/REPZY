import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalorieSummaryCard } from "@/components/calorie-summary-card";
import { MacrosCard } from "@/components/macros-card";
import { ProteinChart } from "@/components/protein-chart";
import { WeightWheelPicker } from "@/components/weight-wheel-picker";
import {
  getTarget,
  getWeightEntries,
  listMeals,
  setCalorieTarget,
  setProteinTarget,
  type Meal,
} from "@/lib/api";
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
  const [calorieGoal, setCalorieGoal] = useState(DAILY_CALORIE_GOAL);
  const [proteinGoalOverride, setProteinGoalOverride] = useState<number | null>(null);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetMode, setTargetMode] = useState<"calories" | "protein">("calories");
  const [draftCalorieGoal, setDraftCalorieGoal] = useState(calorieGoal);
  const [draftProteinGoal, setDraftProteinGoal] = useState(DEFAULT_PROTEIN_GOAL);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetError, setTargetError] = useState<string | null>(null);

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
      getTarget(token)
        .then((target) => {
          if (target.calorie_target != null) setCalorieGoal(target.calorie_target);
          if (target.protein_target != null) setProteinGoalOverride(target.protein_target);
        })
        .catch(() => {});
    }, [token])
  );

  if (!user) return null;

  const dailyProteinGoal = proteinGoalOverride
    ? proteinGoalOverride
    : bodyWeight
    ? Math.round(bodyWeight * PROTEIN_PER_KG)
    : DEFAULT_PROTEIN_GOAL;

  function openTargetModal() {
    setDraftCalorieGoal(calorieGoal);
    setDraftProteinGoal(dailyProteinGoal);
    setTargetMode("calories");
    setTargetError(null);
    setTargetModalVisible(true);
  }

  async function saveTarget() {
    if (!token) return;
    setTargetError(null);
    setIsSavingTarget(true);
    try {
      if (targetMode === "calories") {
        await setCalorieTarget(token, draftCalorieGoal);
        setCalorieGoal(draftCalorieGoal);
      } else {
        await setProteinTarget(token, draftProteinGoal);
        setProteinGoalOverride(draftProteinGoal);
      }
      setTargetModalVisible(false);
    } catch (err) {
      setTargetError(err instanceof Error ? err.message : "Failed to save target");
    } finally {
      setIsSavingTarget(false);
    }
  }

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

          <Pressable style={styles.actionColumn} onPress={openTargetModal}>
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
          goal={calorieGoal}
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

      <Modal
        visible={targetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTargetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {targetMode === "calories" ? "Set calorie target" : "Set protein target"}
            </Text>

            <View style={styles.modeSwitch}>
              <Pressable
                style={[styles.modeSwitchOption, targetMode === "calories" && styles.modeSwitchOptionActive]}
                onPress={() => setTargetMode("calories")}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    targetMode === "calories" && styles.modeSwitchTextActive,
                  ]}
                >
                  Calories
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeSwitchOption, targetMode === "protein" && styles.modeSwitchOptionActive]}
                onPress={() => setTargetMode("protein")}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    targetMode === "protein" && styles.modeSwitchTextActive,
                  ]}
                >
                  Protein
                </Text>
              </Pressable>
            </View>

            {targetMode === "calories" ? (
              <WeightWheelPicker
                value={draftCalorieGoal}
                onChange={setDraftCalorieGoal}
                min={500}
                max={5000}
                step={10}
                decimals={0}
                unit="g"
              />
            ) : (
              <WeightWheelPicker
                value={draftProteinGoal}
                onChange={setDraftProteinGoal}
                min={20}
                max={300}
                step={1}
                decimals={0}
                unit="g"
              />
            )}

            {targetError && <Text style={styles.modalError}>{targetError}</Text>}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setTargetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveButton, isSavingTarget && styles.modalSaveButtonDisabled]}
                onPress={saveTarget}
                disabled={isSavingTarget}
              >
                <Text style={styles.modalSaveText}>{isSavingTarget ? "Saving..." : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: "#e9e9e9",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  modeSwitchOption: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  modeSwitchOptionActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  modeSwitchText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  modeSwitchTextActive: { color: "#111827" },
  modalError: { fontSize: 13, color: "#ef4444" },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e9e9e9",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  modalSaveButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  modalSaveButtonDisabled: { opacity: 0.6 },
  modalSaveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
