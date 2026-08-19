import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, ClipPath, Defs, G, Line, Path } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createHeightEntry,
  createWeightEntry,
  getHeightEntries,
  getWeightEntries,
  type WeightEntry,
} from "@/lib/api";
import { WeightChart } from "@/components/weight-chart";
import { WeightWheelPicker } from "@/components/weight-wheel-picker";
import { BmiCard } from "@/components/bmi-card";
import { useAuth } from "@/lib/auth-context";

const DAILY_WATER_GOAL_L = 5;
const WATER_CONSUMED_L = 2.4;
const DAILY_WATER_GOAL_ML = Math.round(DAILY_WATER_GOAL_L * 1000);
const WATER_CONSUMED_ML = Math.round(WATER_CONSUMED_L * 1000);
const GAUGE_R = 40;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC_FRACTION = 0.75;
const GAUGE_ARC_LEN = GAUGE_C * GAUGE_ARC_FRACTION;
const GAUGE_ROTATE = 135;
const GAUGE_TICKS = Array.from({ length: 28 }, (_, i) => {
  const angle = ((GAUGE_ROTATE + i * 10) * Math.PI) / 180;
  return {
    key: i,
    x1: 50 + 46 * Math.cos(angle),
    y1: 50 + 46 * Math.sin(angle),
    x2: 50 + 50 * Math.cos(angle),
    y2: 50 + 50 * Math.sin(angle),
  };
});

const DROP_PATH =
  "M50 8C50 8 22 46 22 68C22 84.5685 34.4315 97 50 97C65.5685 97 78 84.5685 78 68C78 46 50 8 50 8Z";

export default function LifestyleScreen() {
  const { user, token } = useAuth();
  const [currentWeight, setCurrentWeight] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [bodyStatMode, setBodyStatMode] = useState<"weight" | "height">("weight");
  const [draftWeight, setDraftWeight] = useState(currentWeight);
  const [draftHeight, setDraftHeight] = useState(heightCm);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [isSavingHeight, setIsSavingHeight] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getWeightEntries(token)
      .then((entries) => {
        if (cancelled || entries.length === 0) return;
        setWeightEntries(entries);
        setCurrentWeight(entries[entries.length - 1].weight);
      })
      .catch(() => {});

    getHeightEntries(token)
      .then((entries) => {
        if (cancelled || entries.length === 0) return;
        setHeightCm(entries[entries.length - 1].height);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [token, chartRefreshKey]);

  if (!user) return null;

  const sortedEntries = [...weightEntries].sort(
    (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime(),
  );
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const januaryEntry =
    sortedEntries.find((entry) => new Date(entry.recorded_date) >= yearStart) ??
    sortedEntries[0];
  const weightSinceJan = januaryEntry ? currentWeight - januaryEntry.weight : 0;
  const weightTrendUp = weightSinceJan >= 0;

  const waterProgress = Math.min(1, WATER_CONSUMED_L / DAILY_WATER_GOAL_L);
  const dropWaveY = 88 - waterProgress * 68;
  const dropWavePath = `M10,${dropWaveY} C25,${dropWaveY - 7} 35,${dropWaveY + 7} 50,${dropWaveY} C65,${dropWaveY - 7} 75,${dropWaveY + 7} 90,${dropWaveY} L90,105 L10,105 Z`;

  function openWeightModal() {
    setDraftWeight(currentWeight);
    setDraftHeight(heightCm);
    setBodyStatMode("weight");
    setWeightError(null);
    setHeightError(null);
    setWeightModalVisible(true);
  }

  async function saveWeight() {
    if (!token) return;
    setWeightError(null);
    setIsSavingWeight(true);
    try {
      await createWeightEntry(token, draftWeight);
      setCurrentWeight(draftWeight);
      setChartRefreshKey((k) => k + 1);
      setWeightModalVisible(false);
    } catch (err) {
      setWeightError(err instanceof Error ? err.message : "Failed to save weight");
    } finally {
      setIsSavingWeight(false);
    }
  }

  async function saveHeight() {
    if (!token) return;
    setHeightError(null);
    setIsSavingHeight(true);
    try {
      await createHeightEntry(token, draftHeight);
      setHeightCm(draftHeight);
      setWeightModalVisible(false);
    } catch (err) {
      setHeightError(err instanceof Error ? err.message : "Failed to save height");
    } finally {
      setIsSavingHeight(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Lifestyle</Text>

          <View style={styles.statRow}>
            <View style={styles.waterCard}>
              <View style={styles.gaugeWrap}>
                <Svg width={90} height={90} viewBox="0 0 100 100">
                  {GAUGE_TICKS.map((tick) => (
                    <Line
                      key={tick.key}
                      x1={tick.x1}
                      y1={tick.y1}
                      x2={tick.x2}
                      y2={tick.y2}
                      stroke="#e5e9f0"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  ))}
                  <Circle
                    cx="50"
                    cy="50"
                    r={GAUGE_R}
                    stroke="#e9edf3"
                    strokeWidth={9}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${GAUGE_ARC_LEN} ${GAUGE_C}`}
                    transform={`rotate(${GAUGE_ROTATE} 50 50)`}
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r={GAUGE_R}
                    stroke="#38bdf8"
                    strokeWidth={9}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${GAUGE_ARC_LEN * waterProgress} ${GAUGE_C}`}
                    transform={`rotate(${GAUGE_ROTATE} 50 50)`}
                  />
                </Svg>
                <View style={styles.dropWrap}>
                  <Svg width={38} height={38} viewBox="0 0 100 105">
                    <Defs>
                      <ClipPath id="dropClip">
                        <Path d={DROP_PATH} />
                      </ClipPath>
                    </Defs>
                    <Path d={DROP_PATH} fill="#eef2f7" stroke="#dbe4ee" strokeWidth={2} />
                    <G clipPath="url(#dropClip)">
                      <Path d={dropWavePath} fill="#38bdf8" />
                    </G>
                  </Svg>
                </View>
              </View>
              <Text style={styles.gaugeValue}>{WATER_CONSUMED_ML}</Text>
              <Text style={styles.gaugeGoal}>/{DAILY_WATER_GOAL_ML} mL</Text>
            </View>

            <View style={styles.weightCard}>
              <View style={styles.weightCardHeader}>
                <View style={styles.weightCardIcon}>
                  <MaterialCommunityIcons name="weight-kilogram" size={16} color="#6b7280" />
                </View>
                <Text style={styles.weightCardTitle}>Weight</Text>
              </View>
              <View style={styles.weightCardValueWrap}>
                <Text style={styles.weightCardValue}>
                  {currentWeight.toFixed(2)}
                  <Text style={styles.weightCardUnit}> kg</Text>
                </Text>
              </View>
              {januaryEntry && (
                <View style={styles.weightCardTrendRow}>
                  <Svg viewBox="0 0 24 24" fill="none" width={12} height={12}>
                    <Path
                      d={weightTrendUp ? "M4 17L17 4M17 4H8M17 4V13" : "M4 7L17 20M17 20H8M17 20V11"}
                      stroke={weightTrendUp ? "#ef4444" : "#22c55e"}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text
                    style={[
                      styles.weightCardTrendValue,
                      { color: weightTrendUp ? "#ef4444" : "#22c55e" },
                    ]}
                  >
                    {weightTrendUp ? "+" : ""}
                    {weightSinceJan.toFixed(1)}kg
                  </Text>
                  <Text style={styles.weightCardSubtitle}> since Jan</Text>
                </View>
              )}
            </View>
          </View>

          <BmiCard weightKg={currentWeight} heightCm={heightCm} />

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>Water tracker</Text>
              <View style={[styles.actionIcon, styles.actionIconSky]}>
                <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <Path
                    d="M12 5v14M5 12h14"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={openWeightModal}>
              <Text style={styles.actionText}>Body stats</Text>
              <View style={[styles.actionIcon, styles.actionIconLime]}>
                <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <Path
                    d="M12 5v14M5 12h14"
                    stroke="#65a30d"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </Pressable>
          </View>

          <WeightChart key={chartRefreshKey} title="Weight this year" />
        </View>
      </ScrollView>

      <Modal
        visible={weightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {bodyStatMode === "weight" ? "Add weight" : "Add height"}
            </Text>

            <View style={styles.modeSwitch}>
              <Pressable
                style={[styles.modeSwitchOption, bodyStatMode === "weight" && styles.modeSwitchOptionActive]}
                onPress={() => setBodyStatMode("weight")}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    bodyStatMode === "weight" && styles.modeSwitchTextActive,
                  ]}
                >
                  Weight
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeSwitchOption, bodyStatMode === "height" && styles.modeSwitchOptionActive]}
                onPress={() => setBodyStatMode("height")}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    bodyStatMode === "height" && styles.modeSwitchTextActive,
                  ]}
                >
                  Height
                </Text>
              </Pressable>
            </View>

            {bodyStatMode === "weight" ? (
              <WeightWheelPicker value={draftWeight} onChange={setDraftWeight} />
            ) : (
              <WeightWheelPicker
                value={draftHeight}
                onChange={setDraftHeight}
                min={100}
                max={230}
                step={1}
                decimals={0}
                unit="cm"
              />
            )}

            {bodyStatMode === "weight" && weightError && (
              <Text style={styles.modalError}>{weightError}</Text>
            )}
            {bodyStatMode === "height" && heightError && (
              <Text style={styles.modalError}>{heightError}</Text>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              {bodyStatMode === "weight" ? (
                <Pressable
                  style={[styles.modalSaveButton, isSavingWeight && styles.modalSaveButtonDisabled]}
                  onPress={saveWeight}
                  disabled={isSavingWeight}
                >
                  <Text style={styles.modalSaveText}>{isSavingWeight ? "Saving..." : "Save"}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.modalSaveButton, isSavingHeight && styles.modalSaveButtonDisabled]}
                  onPress={saveHeight}
                  disabled={isSavingHeight}
                >
                  <Text style={styles.modalSaveText}>{isSavingHeight ? "Saving..." : "Save"}</Text>
                </Pressable>
              )}
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
  statRow: { flexDirection: "row", gap: 16, alignItems: "stretch" },
  weightCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    gap: 6,
    backgroundColor: "#fff",
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  weightCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  weightCardIcon: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  weightCardTitle: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  weightCardValueWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weightCardValue: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  weightCardUnit: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  weightCardSubtitle: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  weightCardTrendRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
  weightCardTrendValue: { fontSize: 13, fontWeight: "700" },
  waterCard: {
    flex: 1,
    borderRadius: 24,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  gaugeWrap: {
    height: 90,
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  dropWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeValue: { fontSize: 24, fontWeight: "800", color: "#111827", marginTop: 4 },
  gaugeGoal: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 16 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  actionText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111827" },
  actionIcon: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  actionIconSky: { backgroundColor: "#e0f2fe" },
  actionIconLime: { backgroundColor: "#ecfccb" },
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
