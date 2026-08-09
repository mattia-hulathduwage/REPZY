import { useMemo, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function WeightWheelPicker({
  value,
  onChange,
  min = 30,
  max = 150,
  step = 0.1,
  decimals = 1,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  unit?: string;
}) {
  const listRef = useRef<FlatList<number>>(null);

  const values = useMemo(() => {
    const count = Math.round((max - min) / step) + 1;
    const factor = 10 ** decimals;
    return Array.from({ length: count }, (_, i) => Math.round((min + i * step) * factor) / factor);
  }, [min, max, step, decimals]);

  const selectedIndex = useMemo(() => {
    const index = Math.round((value - min) / step);
    return Math.min(Math.max(index, 0), values.length - 1);
  }, [value, min, step, values.length]);

  function handleMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.min(Math.max(Math.round(offsetY / ITEM_HEIGHT), 0), values.length - 1);
    onChange(values[index]);
  }

  return (
    <View style={styles.wrapper}>
      <View pointerEvents="none" style={styles.centerHighlight} />
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => {
          const isSelected = item === values[selectedIndex];
          return (
            <View style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item.toFixed(decimals)}{unit ? ` ${unit}` : ""}
              </Text>
            </View>
          );
        }}
        style={{ height: PICKER_HEIGHT }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: PICKER_HEIGHT,
    justifyContent: "center",
  },
  centerHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#e9e9e9",
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { fontSize: 18, color: "#9ca3af" },
  itemTextSelected: { fontSize: 22, fontWeight: "700", color: "#111827" },
});
