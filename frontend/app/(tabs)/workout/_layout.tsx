import { Stack } from "expo-router";

export default function WorkoutStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-schedule" />
      <Stack.Screen name="schedule-list" />
      <Stack.Screen name="schedule-view" />
      <Stack.Screen name="muscle-anatomy" />
    </Stack>
  );
}
