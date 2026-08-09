import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { createMeal, type MealType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type ItemRow = {
  key: string;
  foodName: string;
  quantity: string;
  unit: string;
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const UNIT_OPTIONS = ["slice", "cup", "glass", "piece", "tbsp", "tsp", "gram", "ml"];

function emptyForm(): Omit<ItemRow, "key"> {
  return { foodName: "", quantity: "1", unit: "" };
}

export default function AddMealItemsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mealType: MealType = VALID_MEAL_TYPES.includes(type as MealType)
    ? (type as MealType)
    : "breakfast";

  const [items, setItems] = useState<ItemRow[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);

  function validateForm(): string | null {
    if (!form.foodName.trim()) return "Enter a food name";
    const quantity = parseFloat(form.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) return "Quantity must be greater than 0";
    return null;
  }

  function handleAddOrUpdate() {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);

    if (editingKey) {
      setItems((prev) =>
        prev.map((i) => (i.key === editingKey ? { ...form, key: editingKey } : i))
      );
      setEditingKey(null);
    } else {
      setItems((prev) => [...prev, { ...form, key: `${Date.now()}-${Math.random()}` }]);
    }
    setForm(emptyForm());
  }

  function handleEditItem(item: ItemRow) {
    setForm({
      foodName: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
    });
    setEditingKey(item.key);
    setFormError(null);
  }

  function handleDeleteEditing() {
    if (!editingKey) return;
    setItems((prev) => prev.filter((i) => i.key !== editingKey));
    setEditingKey(null);
    setForm(emptyForm());
    setFormError(null);
  }

  function handleCancelEdit() {
    setEditingKey(null);
    setForm(emptyForm());
    setFormError(null);
  }

  async function handleSave() {
    if (!token) return;
    if (items.length === 0) {
      setSaveError("Add at least one item before saving");
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      await createMeal(token, {
        meal_type: mealType,
        logged_at: new Date().toISOString(),
        items: items.map((i) => ({
          food_name: i.foodName.trim(),
          quantity: parseFloat(i.quantity),
          unit: i.unit.trim() || null,
        })),
      });
      router.dismissTo("/nutrition");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save meal");
    } finally {
      setIsSaving(false);
    }
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
            <Text style={styles.title}>{MEAL_LABELS[mealType]}</Text>
          </View>

          <View style={styles.totalsCard}>
            <View>
              <Text style={styles.totalsLabel}>Items added</Text>
              <Text style={styles.totalsValue}>{items.length}</Text>
            </View>
            <Text style={styles.totalsHint}>
              Calories, protein, carbs & fat are estimated by AI when you save
            </Text>
          </View>

          {items.length > 0 && (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.itemRow, editingKey === item.key && styles.itemRowActive]}
                  onPress={() => handleEditItem(item)}
                >
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemName}>{item.foodName}</Text>
                    <Text style={styles.itemDetail}>
                      {item.quantity}
                      {item.unit ? ` ${item.unit}` : ""}
                    </Text>
                  </View>
                  <Svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                    <Path
                      d="M9 6l6 6-6 6"
                      stroke="#9ca3af"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingKey ? "Edit item" : "Add another item"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Food name"
              placeholderTextColor="#9ca3af"
              value={form.foodName}
              onChangeText={(v) => setForm((f) => ({ ...f, foodName: v }))}
            />

            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.input, styles.fieldFlex]}
                placeholder="Quantity"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={form.quantity}
                onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
              />
              <Pressable
                style={[styles.input, styles.fieldFlex, styles.dropdownInput]}
                onPress={() => setUnitPickerVisible(true)}
              >
                <Text style={form.unit ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {form.unit || "Unit"}
                </Text>
                <Svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
                  <Path
                    d="M6 9l6 6 6-6"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            </View>

            {formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.formActions}>
              {editingKey && (
                <Pressable style={styles.deleteButton} onPress={handleDeleteEditing}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              )}
              {editingKey && (
                <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              )}
              <Pressable style={styles.addButton} onPress={handleAddOrUpdate}>
                <Text style={styles.addButtonText}>
                  {editingKey ? "Update item" : "Add item"}
                </Text>
              </Pressable>
            </View>
          </View>

          {saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.saveButtonRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Calculating nutrition...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save meal</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={unitPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnitPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setUnitPickerVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Unit</Text>
            <ScrollView style={styles.unitOptionsList}>
              {UNIT_OPTIONS.map((unit) => (
                <Pressable
                  key={unit}
                  style={styles.unitOption}
                  onPress={() => {
                    setForm((f) => ({ ...f, unit }));
                    setUnitPickerVisible(false);
                  }}
                >
                  <Text style={styles.unitOptionText}>{unit}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  totalsCard: {
    flexDirection: "row",
    gap: 32,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  totalsLabel: { fontSize: 12, color: "#9ca3af" },
  totalsValue: { marginTop: 4, fontSize: 22, fontWeight: "800", color: "#111827" },
  totalsHint: { flex: 1, fontSize: 12, color: "#9ca3af", lineHeight: 16 },
  itemsList: { gap: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemRowActive: { borderWidth: 2, borderColor: "#ea580c" },
  itemTextWrap: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  itemDetail: { marginTop: 2, fontSize: 12, color: "#6b7280" },
  formCard: {
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  formTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  input: {
    borderRadius: 12,
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  fieldRow: { flexDirection: "row", gap: 8 },
  fieldFlex: { flex: 1 },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: { fontSize: 14, color: "#111827" },
  dropdownPlaceholder: { fontSize: 14, color: "#9ca3af" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 24,
    backgroundColor: "#fff",
    padding: 12,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  unitOptionsList: { maxHeight: 320 },
  unitOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textTransform: "capitalize",
  },
  errorText: { fontSize: 13, color: "#ef4444" },
  formActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  deleteButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fef2f2",
  },
  deleteButtonText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },
  cancelButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#e9e9e9",
  },
  cancelButtonText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  addButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffedd5",
  },
  addButtonText: { fontSize: 13, fontWeight: "600", color: "#ea580c" },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  saveButtonText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
