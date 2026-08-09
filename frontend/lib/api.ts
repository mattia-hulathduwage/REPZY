declare const process: { env?: Record<string, string | undefined> } | undefined;

const API_URL = (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ?? "http://localhost:8000";

export type User = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

export async function signup(params: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function changePassword(
  token: string,
  params: { currentPassword: string; newPassword: string }
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: params.currentPassword,
      new_password: params.newPassword,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function logout(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export type WeightEntry = {
  id: string;
  weight: number;
  recorded_date: string;
};

export async function createWeightEntry(token: string, weight: number): Promise<WeightEntry> {
  const res = await fetch(`${API_URL}/weight/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ weight }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getWeightEntries(token: string): Promise<WeightEntry[]> {
  const res = await fetch(`${API_URL}/weight/entries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type HeightEntry = {
  id: string;
  height: number;
  recorded_date: string;
};

export async function createHeightEntry(token: string, height: number): Promise<HeightEntry> {
  const res = await fetch(`${API_URL}/height/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ height }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getHeightEntries(token: string): Promise<HeightEntry[]> {
  const res = await fetch(`${API_URL}/height/entries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
};

export async function listExercises(token: string, search: string): Promise<Exercise[]> {
  const res = await fetch(`${API_URL}/exercises?search=${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createExercise(
  token: string,
  params: { name: string; category?: string | null }
): Promise<Exercise> {
  const res = await fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type ScheduleDayExerciseInput = {
  exercise_id?: string;
  exercise_name?: string;
  order_index: number;
  sets?: number | null;
  reps?: string | null;
  weight?: number | null;
  rest_seconds?: number | null;
};

export type ScheduleDayInput = {
  day_number: number;
  day_label?: string | null;
  is_rest: boolean;
  exercises: ScheduleDayExerciseInput[];
};

export type ScheduleDayExercise = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  weight: number | null;
  rest_seconds: number | null;
};

export type ScheduleDay = {
  id: string;
  day_number: number;
  day_label: string | null;
  is_rest: boolean;
  exercises: ScheduleDayExercise[];
};

export type WorkoutScheduleSummary = {
  id: string;
  name: string;
  num_days: number;
  is_active: boolean;
};

export type WorkoutSchedule = WorkoutScheduleSummary & {
  days: ScheduleDay[];
};

export async function listSchedules(token: string): Promise<WorkoutScheduleSummary[]> {
  const res = await fetch(`${API_URL}/schedules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSchedule(token: string, id: string): Promise<WorkoutSchedule> {
  const res = await fetch(`${API_URL}/schedules/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createSchedule(
  token: string,
  params: { name: string; num_days: number; days: ScheduleDayInput[] }
): Promise<WorkoutSchedule> {
  const res = await fetch(`${API_URL}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateSchedule(
  token: string,
  id: string,
  params: { name: string; num_days: number; is_active: boolean; days: ScheduleDayInput[] }
): Promise<WorkoutSchedule> {
  const res = await fetch(`${API_URL}/schedules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteSchedule(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/schedules/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function duplicateSchedule(token: string, id: string): Promise<WorkoutSchedule> {
  const res = await fetch(`${API_URL}/schedules/${id}/duplicate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function activateSchedule(
  token: string,
  id: string
): Promise<WorkoutScheduleSummary> {
  const res = await fetch(`${API_URL}/schedules/${id}/activate`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealItemInput = {
  food_name: string;
  quantity: number;
  unit?: string | null;
};

export type MealItem = {
  id: string;
  food_name: string;
  quantity: number;
  unit: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
};

export type Meal = {
  id: string;
  meal_type: MealType;
  logged_at: string;
  created_at: string;
  items: MealItem[];
};

export async function createMeal(
  token: string,
  params: { meal_type: MealType; logged_at: string; items: MealItemInput[] }
): Promise<Meal> {
  const res = await fetch(`${API_URL}/meals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listMeals(token: string): Promise<Meal[]> {
  const res = await fetch(`${API_URL}/meals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
