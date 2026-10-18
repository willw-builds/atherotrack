export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodCategory =
  | 'dairy_eggs'
  | 'meats_poultry'
  | 'seafood'
  | 'plant_protein'
  | 'grains_fiber'
  | 'fruits_veggies'
  | 'legumes_beans'
  | 'nuts_seeds'
  | 'fats_oils'
  | 'baked_sweets'
  | 'other';

export type HeartGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: string;
  servingGrams: number;
  calories: number;
  cholesterolMg: number; // in milligrams
  saturatedFatG: number; // in grams
  transFatG: number; // in grams
  unsaturatedFatG: number; // mono + polyunsaturated in grams
  solubleFiberG: number; // in grams (crucial for clearing LDL)
  totalFiberG: number; // in grams
  proteinG: number; // in grams
  carbsG: number; // in grams
  sodiumMg: number; // in milligrams
  heartGrade: HeartGrade;
  swapSuggestion?: string;
  isCustom?: boolean;
}

export interface MealEntry {
  id: string;
  foodItemId: string;
  foodName: string;
  category: FoodCategory;
  mealType: MealType;
  timestamp: string; // ISO string
  dateString: string; // YYYY-MM-DD
  servings: number; // multiplier, e.g. 1.0, 1.5, 0.5
  servingGrams: number;
  calories: number;
  cholesterolMg: number;
  saturatedFatG: number;
  transFatG: number;
  unsaturatedFatG: number;
  solubleFiberG: number;
  totalFiberG: number;
  proteinG: number;
  carbsG: number;
  sodiumMg: number;
  swapSuggestion?: string;
}

export interface LipidPanelEntry {
  id: string;
  dateString: string; // YYYY-MM-DD
  totalCholesterol: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  triglycerides: number; // mg/dL
  notes?: string;
}

export interface LipidClassification {
  total: 'optimal' | 'borderline' | 'high';
  ldl: 'optimal' | 'near-optimal' | 'borderline' | 'high' | 'very-high';
  hdl: 'low' | 'normal' | 'optimal';
  triglycerides: 'normal' | 'borderline' | 'high' | 'very-high';
  nonHdl: number;
  totalToHdlRatio: number;
  ratioStatus: 'ideal' | 'normal' | 'elevated';
}

export type TargetPreset = 'aha_high_risk' | 'standard_adult' | 'mediterranean' | 'custom';

export interface NutritionTargets {
  preset: TargetPreset;
  maxCholesterolMg: number; // AHA recommends <200mg for high risk, <300mg general
  maxSaturatedFatG: number; // <5-6% of 2000 kcal = ~11-13g
  maxTransFatG: number; // strictly 0g
  minSolubleFiberG: number; // 10g-15g/day minimum
  minTotalFiberG: number; // 25-35g/day
  maxSodiumMg: number; // 2000mg
  targetCalories: number; // 2000 kcal
}

export interface HeartSwapItem {
  id: string;
  originalName: string;
  originalCategory: FoodCategory;
  originalCholesterolMg: number;
  originalSaturatedFatG: number;
  originalSolubleFiberG: number;
  swapName: string;
  swapCholesterolMg: number;
  swapSaturatedFatG: number;
  swapSolubleFiberG: number;
  benefitDescription: string;
  recipeOrTip: string;
}
