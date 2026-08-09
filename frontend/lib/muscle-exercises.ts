export type MuscleKey =
  | "chest"
  | "bicep"
  | "tricep"
  | "legs"
  | "shoulders"
  | "abs"
  | "calfs"
  | "forearms"
  | "hamstring"
  | "trapezius"
  | "upperBack"
  | "lowerBack";

export type Exercise = {
  name: string;
  isBest?: boolean;
};

export type ExerciseGroup = {
  region?: string;
  exercises: Exercise[];
};

export const EXERCISES_BY_MUSCLE: Record<MuscleKey, ExerciseGroup[]> = {
  chest: [
    {
      region: "Upper chest",
      exercises: [
        { name: "Incline Barbell Bench Press", isBest: true },
        { name: "Incline Dumbbell Bench Press" },
        { name: "Low-to-High Cable Fly" },
      ],
    },
    {
      region: "Mid chest",
      exercises: [
        { name: "Flat Barbell Bench Press", isBest: true },
        { name: "Flat Dumbbell Bench Press" },
        { name: "Machine Chest Press" },
      ],
    },
    {
      region: "Lower chest",
      exercises: [
        { name: "Chest Dips (Leaning Forward)", isBest: true },
        { name: "Decline Barbell Bench Press" },
        { name: "High-to-Low Cable Fly" },
      ],
    },
  ],
  bicep: [
    {
      region: "Long Head (Biceps Peak)",
      exercises: [
        { name: "Incline Dumbbell Curl", isBest: true },
        { name: "Bayesian Cable Curl" },
        { name: "Close-Grip EZ-Bar Curl" },
      ],
    },
    {
      region: "Short Head (Biceps Thickness)",
      exercises: [
        { name: "Preacher Curl", isBest: true },
        { name: "Wide-Grip EZ-Bar Curl" },
        { name: "Spider Curl" },
      ],
    },
    {
      region: "Brachialis (Arm Width)",
      exercises: [
        { name: "Hammer Curl", isBest: true },
        { name: "Cross-Body Hammer Curl" },
        { name: "Reverse EZ-Bar Curl" },
      ],
    },
  ],
  tricep: [
    {
      region: "Long Head (Largest head)",
      exercises: [
        { name: "Overhead Cable Triceps Extension", isBest: true },
        { name: "Overhead Dumbbell Triceps Extension" },
        { name: "EZ-Bar Skull Crushers" },
      ],
    },
    {
      region: "Lateral Head (Outer horseshoe)",
      exercises: [
        { name: "Cable Triceps Pushdown (Straight Bar)", isBest: true },
        { name: "V-Bar Pushdown" },
        { name: "Close-Grip Bench Press" },
      ],
    },
    {
      region: "Medial Head (Deep head)",
      exercises: [
        { name: "Reverse-Grip Cable Pushdown", isBest: true },
        { name: "Diamond Push-Ups" },
        { name: "Close-Grip Bench Press" },
      ],
    },
  ],
  legs: [
    {
      exercises: [
        { name: "Hack Squat", isBest: true },
        { name: "High-Bar Back Squat" },
        { name: "Leg Press" },
        { name: "Leg Extension" },
      ],
    },
  ],
  shoulders: [
    {
      region: "Front Delt (Anterior)",
      exercises: [
        { name: "Barbell Overhead Press", isBest: true },
        { name: "Dumbbell Shoulder Press" },
        { name: "Machine Shoulder Press" },
      ],
    },
    {
      region: "Side Delt (Lateral)",
      exercises: [
        { name: "Cable Lateral Raise", isBest: true },
        { name: "Dumbbell Lateral Raise" },
        { name: "Machine Lateral Raise" },
      ],
    },
    {
      region: "Rear Delt (Posterior)",
      exercises: [
        { name: "Reverse Pec Deck", isBest: true },
        { name: "Cable Rear Delt Fly" },
        { name: "Face Pulls" },
      ],
    },
  ],
  abs: [
    {
      exercises: [
        { name: "Cable Crunch", isBest: true },
        { name: "Hanging Leg Raise" },
        { name: "Ab Wheel Rollout" },
      ],
    },
  ],
  calfs: [
    {
      region: "Gastrocnemius (Standing Calf Growth)",
      exercises: [
        { name: "Standing Calf Raise", isBest: true },
        { name: "Leg Press Calf Raise" },
        { name: "Donkey Calf Raise" },
      ],
    },
    {
      region: "Soleus (Seated Calf Growth)",
      exercises: [
        { name: "Seated Calf Raise", isBest: true },
        { name: "Seated Machine Calf Press" },
        { name: "Bent-Knee Calf Raise" },
      ],
    },
  ],
  forearms: [
    {
      region: "Wrist Flexors (Inner Forearm)",
      exercises: [
        { name: "Seated Wrist Curl", isBest: true },
        { name: "Behind-the-Back Wrist Curl" },
        { name: "Cable Wrist Curl" },
      ],
    },
    {
      region: "Wrist Extensors (Outer Forearm)",
      exercises: [
        { name: "Reverse Wrist Curl", isBest: true },
        { name: "Dumbbell Reverse Wrist Curl" },
        { name: "Cable Reverse Wrist Curl" },
      ],
    },
    {
      region: "Brachioradialis (Forearm Width)",
      exercises: [
        { name: "Hammer Curl", isBest: true },
        { name: "Reverse EZ-Bar Curl" },
        { name: "Cross-Body Hammer Curl" },
      ],
    },
  ],
  hamstring: [
    {
      region: "Hip Hinge (Hamstring Lengthened Position)",
      exercises: [
        { name: "Romanian Deadlift (RDL)", isBest: true },
        { name: "Stiff-Leg Deadlift" },
        { name: "Good Morning" },
      ],
    },
    {
      region: "Knee Flexion (Hamstring Contraction)",
      exercises: [
        { name: "Lying Leg Curl", isBest: true },
        { name: "Seated Leg Curl" },
        { name: "Nordic Hamstring Curl" },
      ],
    },
  ],
  trapezius: [
    {
      region: "Upper Traps",
      exercises: [
        { name: "Barbell Shrug", isBest: true },
        { name: "Dumbbell Shrug" },
        { name: "Machine Shrug" },
      ],
    },
    {
      region: "Middle Traps",
      exercises: [
        { name: "Chest-Supported Row", isBest: true },
        { name: "Barbell Row" },
        { name: "Seated Cable Row" },
      ],
    },
    {
      region: "Lower Traps",
      exercises: [
        { name: "Face Pulls", isBest: true },
        { name: "Prone Y-Raise" },
        { name: "Cable Y-Raise" },
      ],
    },
  ],
  upperBack: [
    {
      exercises: [
        { name: "Chest-Supported Row" },
        { name: "Seated Cable Row" },
        { name: "Reverse Pec Deck" },
      ],
    },
  ],
  lowerBack: [
    {
      exercises: [
        { name: "Deadlift" },
        { name: "Back Extension" },
        { name: "Romanian Deadlift" },
      ],
    },
  ],
};
