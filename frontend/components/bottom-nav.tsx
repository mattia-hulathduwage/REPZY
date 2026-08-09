import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const ITEM_SIZE = 44;

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  dashboard: (active) => (
    <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
      <Path
        d="M4 11.5 12 4l8 7.5M6 10v9h12v-9"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  workout: (active) => (
    <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
      <Path
        d="M6.5 8.5v7M2.5 10v4M17.5 8.5v7M21.5 10v4M6.5 12h11"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  nutrition: (active) => (
    <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
      <Path
        d="M6 3v7a3 3 0 0 0 3 3v8M6 3v7M9 3v7M18 3c-2 2-2 5-2 7 0 1.5 1 2 2 2v9"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  lifestyle: (active) => (
    <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
      <Path
        d="M20 4c-8 0-14 5-14 13 0 1.5 1 2.5 2.5 2.5C16.5 19.5 20 12 20 4Z"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 19.5C7 16 9 13 12 11"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  profile: (active) => (
    <Svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
      <Circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
      />
      <Path
        d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
        stroke={active ? "#df6847" : "#fff"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  ),
};

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const [positions, setPositions] = useState<Record<string, number>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const hasPositionedOnce = useRef(false);

  const activeRoute = state.routes[state.index];
  const activeKey = activeRoute?.key;
  const isActiveTabVisible = Boolean(activeRoute && ICONS[activeRoute.name]);
  const activeX = activeKey ? positions[activeKey] : undefined;

  useEffect(() => {
    if (isActiveTabVisible && activeX != null) {
      if (!hasPositionedOnce.current) {
        indicatorX.setValue(activeX);
        hasPositionedOnce.current = true;
      } else {
        Animated.spring(indicatorX, {
          toValue: activeX,
          useNativeDriver: true,
          bounciness: 8,
          speed: 16,
        }).start();
      }
      Animated.timing(indicatorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [activeX, isActiveTabVisible, indicatorX, indicatorOpacity]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              opacity: indicatorOpacity,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />
        {state.routes.map((route: (typeof state.routes)[number], index: number) => {
          const icon = ICONS[route.name];
          if (!icon) return null;

          const active = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={label}
              onLayout={(e) => {
                const x = e.nativeEvent.layout.x;
                setPositions((prev) => (prev[route.key] === x ? prev : { ...prev, [route.key]: x }));
              }}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}
            >
              {icon(active)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  bar: {
    width: "100%",
    maxWidth: 384,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 999,
    backgroundColor: "#8d8d8d",
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  item: {
    height: ITEM_SIZE,
    width: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 8,
    height: ITEM_SIZE,
    width: ITEM_SIZE,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
});
