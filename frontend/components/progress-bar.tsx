import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function ProgressBar({ pct }: { pct: number }) {
  const coverWidth = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(coverWidth, {
      toValue: 100 - pct,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, coverWidth]);

  return (
    <View style={styles.track}>
      <LinearGradient
        colors={["#ef4444", "#facc15", "#22c55e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View
        style={[
          styles.cover,
          {
            width: coverWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    width: "100%",
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  cover: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f3f4f6",
  },
});
