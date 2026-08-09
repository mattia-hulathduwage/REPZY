import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  createExercise,
  createSchedule,
  getSchedule,
  listExercises,
  updateSchedule,
  type Exercise,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type ExerciseRow = {
  key: string;
  exerciseId?: string;
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
};

type DayState = {
  dayNumber: number;
  label: string;
  isRest: boolean;
  exercises: ExerciseRow[];
};

function makeDay(dayNumber: number): DayState {
  return { dayNumber, label: `Day ${dayNumber}`, isRest: false, exercises: [] };
}

function parseIntOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function parseFloatOrNull(v: string): number | null {
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export default function CreateScheduleScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { id: scheduleId } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof scheduleId === "string" && scheduleId.length > 0;

  const [name, setName] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [days, setDays] = useState<DayState[]>([makeDay(1), makeDay(2), makeDay(3)]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(isEditing);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerResults, setPickerResults] = useState<Exercise[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerCreating, setPickerCreating] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || typeof scheduleId !== "string") {
      // Reset to a blank schedule whenever this screen is opened without an
      // id (e.g. navigating here right after editing another schedule) —
      // the route stays mounted across param changes, so state must be
      // reset explicitly instead of relying on component remount.
      setName("");
      setNumDays(3);
      setDays([makeDay(1), makeDay(2), makeDay(3)]);
      setActiveDayIndex(0);
      setIsActive(true);
      setSaveError(null);
      setIsLoadingSchedule(false);
      return;
    }

    if (!token) return;

    setIsLoadingSchedule(true);
    getSchedule(token, scheduleId)
      .then((schedule) => {
        setName(schedule.name);
        setNumDays(schedule.num_days);
        setIsActive(schedule.is_active);
        setActiveDayIndex(0);
        setDays(
          schedule.days.map((d) => ({
            dayNumber: d.day_number,
            label: d.day_label ?? `Day ${d.day_number}`,
            isRest: d.is_rest,
            exercises: d.exercises.map((e) => ({
              key: e.id,
              exerciseId: e.exercise_id,
              exerciseName: e.exercise_name,
              sets: e.sets != null ? String(e.sets) : "",
              reps: e.reps ?? "",
              weight: e.weight != null ? String(e.weight) : "",
              restSeconds: e.rest_seconds != null ? String(e.rest_seconds) : "",
            })),
          }))
        );
      })
      .catch((err) => {
        setSaveError(err instanceof Error ? err.message : "Failed to load schedule");
      })
      .finally(() => setIsLoadingSchedule(false));
  }, [isEditing, scheduleId, token]);

  function changeNumDays(n: number) {
    setNumDays(n);
    setDays((prev) => {
      const next = prev.slice(0, n);
      for (let i = next.length; i < n; i++) next.push(makeDay(i + 1));
      return next;
    });
    if (activeDayIndex > n - 1) setActiveDayIndex(0);
  }

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function openPicker(dayIndex: number) {
    setActiveDayIndex(dayIndex);
    setPickerQuery("");
    setPickerResults([]);
    setPickerVisible(true);
  }

  useEffect(() => {
    if (!pickerVisible || !token) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPickerLoading(true);
      listExercises(token, pickerQuery)
        .then(setPickerResults)
        .catch(() => setPickerResults([]))
        .finally(() => setPickerLoading(false));
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [pickerQuery, pickerVisible, token]);

  function addExerciseToDay(exercise: Exercise) {
    const row: ExerciseRow = {
      key: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: "3",
      reps: "10",
      weight: "",
      restSeconds: "60",
    };
    setDays((prev) =>
      prev.map((d, i) =>
        i === activeDayIndex ? { ...d, exercises: [...d.exercises, row] } : d
      )
    );
    setPickerVisible(false);
  }

  async function handleCreateAndAdd() {
    if (!token || !pickerQuery.trim()) return;
    setPickerCreating(true);
    try {
      const exercise = await createExercise(token, { name: pickerQuery.trim() });
      addExerciseToDay(exercise);
    } catch {
      // silently ignore; user can retry
    } finally {
      setPickerCreating(false);
    }
  }

  function removeExercise(dayIndex: number, key: string) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, exercises: d.exercises.filter((e) => e.key !== key) } : d
      )
    );
  }

  function moveExercise(dayIndex: number, key: string, direction: -1 | 1) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        const idx = d.exercises.findIndex((e) => e.key === key);
        const newIdx = idx + direction;
        if (idx === -1 || newIdx < 0 || newIdx >= d.exercises.length) return d;
        const exercises = [...d.exercises];
        [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];
        return { ...d, exercises };
      })
    );
  }

  function updateExerciseField(
    dayIndex: number,
    key: string,
    field: keyof ExerciseRow,
    value: string
  ) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              exercises: d.exercises.map((e) => (e.key === key ? { ...e, [field]: value } : e)),
            }
          : d
      )
    );
  }

  async function handleSave() {
    if (!token) return;
    if (!name.trim()) {
      setSaveError("Please enter a schedule name");
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const daysPayload = days.map((d) => ({
        day_number: d.dayNumber,
        day_label: d.label,
        is_rest: d.isRest,
        exercises: d.isRest
          ? []
          : d.exercises.map((e, i) => ({
              exercise_id: e.exerciseId,
              exercise_name: e.exerciseId ? undefined : e.exerciseName,
              order_index: i,
              sets: parseIntOrNull(e.sets),
              reps: e.reps || null,
              weight: parseFloatOrNull(e.weight),
              rest_seconds: parseIntOrNull(e.restSeconds),
            })),
      }));

      if (isEditing && typeof scheduleId === "string") {
        await updateSchedule(token, scheduleId, {
          name: name.trim(),
          num_days: numDays,
          is_active: isActive,
          days: daysPayload,
        });
      } else {
        await createSchedule(token, {
          name: name.trim(),
          num_days: numDays,
          days: daysPayload,
        });
      }
      router.back();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  }

  const activeDay = days[activeDayIndex];

  if (isLoadingSchedule) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#df6847" />
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>{isEditing ? "Edit schedule" : "Create schedule"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Schedule name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="My Schedule Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Number of days</Text>
            <View style={styles.stepperRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => changeNumDays(n)}
                  style={[styles.stepperButton, n === numDays && styles.stepperButtonActive]}
                >
                  <Text
                    style={[styles.stepperText, n === numDays && styles.stepperTextActive]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Days</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayTabsRow}>
                {days.map((d, i) => (
                  <Pressable
                    key={d.dayNumber}
                    onPress={() => setActiveDayIndex(i)}
                    style={[styles.dayTab, i === activeDayIndex && styles.dayTabActive]}
                  >
                    <Text
                      style={[
                        styles.dayTabText,
                        i === activeDayIndex && styles.dayTabTextActive,
                      ]}
                    >
                      {d.label || `Day ${d.dayNumber}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {activeDay && (
              <View style={styles.dayCard}>
                <TextInput
                  style={styles.dayLabelInput}
                  placeholder={`Day ${activeDay.dayNumber} label`}
                  placeholderTextColor="#9ca3af"
                  value={activeDay.label}
                  onChangeText={(v) => updateDay(activeDayIndex, { label: v })}
                />

                <View style={styles.restRow}>
                  <Text style={styles.restLabel}>Rest day</Text>
                  <Switch
                    value={activeDay.isRest}
                    onValueChange={(v) => updateDay(activeDayIndex, { isRest: v })}
                    trackColor={{ true: "#df6847", false: "#e5e7eb" }}
                  />
                </View>

                {!activeDay.isRest && (
                  <>
                    {activeDay.exercises.map((e, idx) => (
                      <View key={e.key} style={styles.exerciseRow}>
                        <View style={styles.exerciseHeaderRow}>
                          <Text style={styles.exerciseName}>{e.exerciseName}</Text>
                          <View style={styles.exerciseActions}>
                            <Pressable
                              onPress={() => moveExercise(activeDayIndex, e.key, -1)}
                              disabled={idx === 0}
                            >
                              <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                                <Path
                                  d="M6 15l6-6 6 6"
                                  stroke={idx === 0 ? "#d1d5db" : "#6b7280"}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </Pressable>
                            <Pressable
                              onPress={() => moveExercise(activeDayIndex, e.key, 1)}
                              disabled={idx === activeDay.exercises.length - 1}
                            >
                              <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                                <Path
                                  d="M6 9l6 6 6-6"
                                  stroke={
                                    idx === activeDay.exercises.length - 1
                                      ? "#d1d5db"
                                      : "#6b7280"
                                  }
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </Pressable>
                            <Pressable onPress={() => removeExercise(activeDayIndex, e.key)}>
                              <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                                <Path
                                  d="M6 6l12 12M18 6L6 18"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </Svg>
                            </Pressable>
                          </View>
                        </View>

                        <View style={styles.exerciseFieldsRow}>
                          <View style={styles.exerciseField}>
                            <Text style={styles.fieldLabel}>Sets</Text>
                            <TextInput
                              style={styles.fieldInput}
                              keyboardType="number-pad"
                              value={e.sets}
                              onChangeText={(v) =>
                                updateExerciseField(activeDayIndex, e.key, "sets", v)
                              }
                            />
                          </View>
                          <View style={styles.exerciseField}>
                            <Text style={styles.fieldLabel}>Reps</Text>
                            <TextInput
                              style={styles.fieldInput}
                              value={e.reps}
                              onChangeText={(v) =>
                                updateExerciseField(activeDayIndex, e.key, "reps", v)
                              }
                            />
                          </View>
                          <View style={styles.exerciseField}>
                            <Text style={styles.fieldLabel}>Weight</Text>
                            <TextInput
                              style={styles.fieldInput}
                              keyboardType="decimal-pad"
                              value={e.weight}
                              onChangeText={(v) =>
                                updateExerciseField(activeDayIndex, e.key, "weight", v)
                              }
                            />
                          </View>
                          <View style={styles.exerciseField}>
                            <Text style={styles.fieldLabel}>Rest (s)</Text>
                            <TextInput
                              style={styles.fieldInput}
                              keyboardType="number-pad"
                              value={e.restSeconds}
                              onChangeText={(v) =>
                                updateExerciseField(activeDayIndex, e.key, "restSeconds", v)
                              }
                            />
                          </View>
                        </View>
                      </View>
                    ))}

                    <Pressable
                      style={styles.addExerciseButton}
                      onPress={() => openPicker(activeDayIndex)}
                    >
                      <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                        <Path
                          d="M12 5v14M5 12h14"
                          stroke="#ea580c"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </Svg>
                      <Text style={styles.addExerciseText}>Add exercise</Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Pressable
              style={styles.reviewHeader}
              onPress={() => setReviewExpanded((v) => !v)}
            >
              <Text style={styles.sectionLabel}>Review</Text>
              <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <Path
                  d={reviewExpanded ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}
                  stroke="#6b7280"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>

            {reviewExpanded && (
              <View style={styles.reviewCard}>
                {days.map((d) => (
                  <View key={d.dayNumber} style={styles.reviewRow}>
                    <Text style={styles.reviewDayLabel}>{d.label || `Day ${d.dayNumber}`}</Text>
                    <Text style={styles.reviewDaySummary}>
                      {d.isRest ? "Rest day" : `${d.exercises.length} exercise${d.exercises.length === 1 ? "" : "s"}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {saveError && <Text style={styles.saveError}>{saveError}</Text>}

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save schedule"}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add exercise</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Search exercises"
              placeholderTextColor="#9ca3af"
              value={pickerQuery}
              onChangeText={setPickerQuery}
              autoFocus
            />

            <ScrollView style={styles.pickerResults}>
              {pickerLoading && (
                <View style={styles.pickerLoadingWrap}>
                  <ActivityIndicator color="#df6847" />
                </View>
              )}
              {!pickerLoading &&
                pickerResults.map((exercise) => (
                  <Pressable
                    key={exercise.id}
                    style={styles.pickerRow}
                    onPress={() => addExerciseToDay(exercise)}
                  >
                    <Text style={styles.pickerRowText}>{exercise.name}</Text>
                  </Pressable>
                ))}
              {!pickerLoading &&
                pickerQuery.trim().length > 0 &&
                !pickerResults.some(
                  (e) => e.name.toLowerCase() === pickerQuery.trim().toLowerCase()
                ) && (
                  <Pressable
                    style={styles.pickerCreateRow}
                    onPress={handleCreateAndAdd}
                    disabled={pickerCreating}
                  >
                    <Text style={styles.pickerCreateText}>
                      {pickerCreating ? "Creating..." : `Create "${pickerQuery.trim()}"`}
                    </Text>
                  </Pressable>
                )}
            </ScrollView>

            <Pressable style={styles.modalCancelButton} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e9e9e9" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  section: { gap: 8 },
  sectionLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  nameInput: {
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepperRow: { flexDirection: "row", gap: 8 },
  stepperButton: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  stepperButtonActive: { backgroundColor: "#111827" },
  stepperText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  stepperTextActive: { color: "#fff" },
  dayTabsRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  dayTabActive: { backgroundColor: "#ea580c" },
  dayTabText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  dayTabTextActive: { color: "#fff" },
  dayCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dayLabelInput: {
    borderRadius: 12,
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  restRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restLabel: { fontSize: 14, fontWeight: "500", color: "#374151" },
  exerciseRow: {
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
    gap: 10,
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseName: { fontSize: 14, fontWeight: "600", color: "#111827", flex: 1 },
  exerciseActions: { flexDirection: "row", gap: 12, alignItems: "center" },
  exerciseFieldsRow: { flexDirection: "row", gap: 8 },
  exerciseField: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 10, color: "#9ca3af" },
  fieldInput: {
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: "#ffedd5",
  },
  addExerciseText: { fontSize: 13, fontWeight: "600", color: "#ea580c" },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewCard: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewDayLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  reviewDaySummary: { fontSize: 13, color: "#6b7280" },
  saveError: { fontSize: 13, color: "#ef4444", textAlign: "center" },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 15, fontWeight: "600", color: "#fff" },
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
    maxHeight: "70%",
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalInput: {
    borderRadius: 12,
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  pickerResults: { maxHeight: 240 },
  pickerHint: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },
  pickerLoadingWrap: { paddingVertical: 12, alignItems: "center" },
  pickerRow: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerRowText: { fontSize: 14, color: "#111827" },
  pickerCreateRow: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  pickerCreateText: { fontSize: 14, fontWeight: "600", color: "#ea580c" },
  modalCancelButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e9e9e9",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
});
