import { Stack } from "expo-router";

export default function NutritionStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-meal" />
      <Stack.Screen name="add-meal-items" />
    </Stack>
  );
}
