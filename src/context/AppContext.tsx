import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, MealEntry, LipidPanelEntry, NutritionTargets, MealType } from '../types';
import { USDA_FOOD_DATABASE } from '../data/usdaFoodDatabase';
import { TARGET_PRESETS } from '../utils/cardiacCalculations';

interface AppContextType {
  // Current active date in YYYY-MM-DD
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Food library (USDA + Custom)
  foods: FoodItem[];
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom'>) => void;

  // Meal logs
  meals: MealEntry[];
  todaysMeals: MealEntry[];
  addMeal: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  deleteMeal: (id: string) => void;

  // Lipid panels
  lipidPanels: LipidPanelEntry[];
  addLipidPanel: (entry: Omit<LipidPanelEntry, 'id'>) => void;
  updateLipidPanel: (id: string, updates: Partial<LipidPanelEntry>) => void;
  deleteLipidPanel: (id: string) => void;

  // Nutrition targets
  targets: NutritionTargets;
  setTargets: (targets: NutritionTargets) => void;

  // Totals for selected date
  dayTotals: {
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
  };

  // State management & export
  resetToSampleData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  exportCsvData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  MEALS: 'athero_meals_v1',
  LIPID_PANELS: 'athero_lipid_panels_v1',
  TARGETS: 'athero_targets_v1',
  CUSTOM_FOODS: 'athero_custom_foods_v1',
};

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOffsetDateString = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Realistic initial sample data to highlight clinical cholesterol mechanics
const generateSampleMeals = (): MealEntry[] => {
  const today = getTodayString();
  const yesterday = getOffsetDateString(-1);
  const twoDaysAgo = getOffsetDateString(-2);

  return [
    // Today: Heart-smart cardioprotective day
    {
      id: 'sample-m1',
      foodItemId: 'steel-cut-oats',
      foodName: 'Steel-Cut Oatmeal (Cooked)',
      category: 'grains_fiber',
      mealType: 'breakfast',
      timestamp: `${today}T08:15:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 240,
      calories: 160,
      cholesterolMg: 0,
      saturatedFatG: 0.5,
      transFatG: 0,
      unsaturatedFatG: 2.0,
      solubleFiberG: 2.2,
      totalFiberG: 4.5,
      proteinG: 5.5,
      carbsG: 29.0,
      sodiumMg: 5,
    },
    {
      id: 'sample-m2',
      foodItemId: 'chia-seeds',
      foodName: 'Chia Seeds (Whole Raw)',
      category: 'nuts_seeds',
      mealType: 'breakfast',
      timestamp: `${today}T08:16:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 24,
      calories: 117,
      cholesterolMg: 0,
      saturatedFatG: 0.8,
      transFatG: 0,
      unsaturatedFatG: 7.0,
      solubleFiberG: 2.5,
      totalFiberG: 8.3,
      proteinG: 4.0,
      carbsG: 10.0,
      sodiumMg: 4,
    },
    {
      id: 'sample-m3',
      foodItemId: 'blueberries-raw',
      foodName: 'Blueberries (Fresh, Anthocyanin-rich)',
      category: 'fruits_veggies',
      mealType: 'breakfast',
      timestamp: `${today}T08:17:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 148,
      calories: 84,
      cholesterolMg: 0,
      saturatedFatG: 0,
      transFatG: 0,
      unsaturatedFatG: 0.2,
      solubleFiberG: 0.7,
      totalFiberG: 3.6,
      proteinG: 1.1,
      carbsG: 21.4,
      sodiumMg: 1,
    },
    {
      id: 'sample-m4',
      foodItemId: 'salmon-wild-atlantic',
      foodName: 'Wild Salmon (Baked / Grilled)',
      category: 'seafood',
      mealType: 'lunch',
      timestamp: `${today}T12:30:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 113,
      calories: 206,
      cholesterolMg: 62,
      saturatedFatG: 1.5,
      transFatG: 0,
      unsaturatedFatG: 7.2,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 28.0,
      carbsG: 0,
      sodiumMg: 65,
    },
    {
      id: 'sample-m5',
      foodItemId: 'black-beans-cooked',
      foodName: 'Black Beans (Boiled / Canned Low-Sodium)',
      category: 'legumes_beans',
      mealType: 'lunch',
      timestamp: `${today}T12:35:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 86,
      calories: 114,
      cholesterolMg: 0,
      saturatedFatG: 0.1,
      transFatG: 0,
      unsaturatedFatG: 0.4,
      solubleFiberG: 2.4,
      totalFiberG: 7.5,
      proteinG: 7.6,
      carbsG: 20.4,
      sodiumMg: 85,
    },
    {
      id: 'sample-m6',
      foodItemId: 'avocado-hass',
      foodName: 'Hass Avocado (Fresh)',
      category: 'fruits_veggies',
      mealType: 'lunch',
      timestamp: `${today}T12:36:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 75,
      calories: 120,
      cholesterolMg: 0,
      saturatedFatG: 1.6,
      transFatG: 0,
      unsaturatedFatG: 8.8,
      solubleFiberG: 1.4,
      totalFiberG: 5.0,
      proteinG: 1.5,
      carbsG: 6.4,
      sodiumMg: 5,
    },
    {
      id: 'sample-m7',
      foodItemId: 'firm-tofu-steamed',
      foodName: 'Firm Tofu (Steamed / Sautéed)',
      category: 'plant_protein',
      mealType: 'dinner',
      timestamp: `${today}T18:45:00.000Z`,
      dateString: today,
      servings: 1.5,
      servingGrams: 189,
      calories: 216,
      cholesterolMg: 0,
      saturatedFatG: 1.8,
      transFatG: 0,
      unsaturatedFatG: 9.7,
      solubleFiberG: 1.2,
      totalFiberG: 3.5,
      proteinG: 25.5,
      carbsG: 5.3,
      sodiumMg: 21,
    },
    {
      id: 'sample-m8',
      foodItemId: 'brussels-sprouts-cooked',
      foodName: 'Brussels Sprouts (Cooked)',
      category: 'fruits_veggies',
      mealType: 'dinner',
      timestamp: `${today}T18:46:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 156,
      calories: 56,
      cholesterolMg: 0,
      saturatedFatG: 0.1,
      transFatG: 0,
      unsaturatedFatG: 0.3,
      solubleFiberG: 2.0,
      totalFiberG: 4.1,
      proteinG: 4.0,
      carbsG: 11.1,
      sodiumMg: 33,
    },
    {
      id: 'sample-m9',
      foodItemId: 'walnuts-halves',
      foodName: 'Walnuts (Raw English)',
      category: 'nuts_seeds',
      mealType: 'snack',
      timestamp: `${today}T15:30:00.000Z`,
      dateString: today,
      servings: 1.0,
      servingGrams: 28,
      calories: 185,
      cholesterolMg: 0,
      saturatedFatG: 1.7,
      transFatG: 0,
      unsaturatedFatG: 16.5,
      solubleFiberG: 0.6,
      totalFiberG: 1.9,
      proteinG: 4.3,
      carbsG: 3.9,
      sodiumMg: 1,
    },

    // Yesterday: An American diner breakfast with high cholesterol & saturated fat to show alert
    {
      id: 'sample-y1',
      foodItemId: 'egg-large-whole',
      foodName: 'Whole Egg (Large, Grade A)',
      category: 'dairy_eggs',
      mealType: 'breakfast',
      timestamp: `${yesterday}T08:30:00.000Z`,
      dateString: yesterday,
      servings: 2.0,
      servingGrams: 100,
      calories: 144,
      cholesterolMg: 372,
      saturatedFatG: 3.2,
      transFatG: 0,
      unsaturatedFatG: 5.4,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 12.6,
      carbsG: 0.8,
      sodiumMg: 142,
      swapSuggestion: 'Try 2 Egg Whites + 1/3 Avocado to eliminate 372mg cholesterol and boost soluble fiber!',
    },
    {
      id: 'sample-y2',
      foodItemId: 'butter-salted',
      foodName: 'Butter (Salted / Unsalted)',
      category: 'dairy_eggs',
      mealType: 'breakfast',
      timestamp: `${yesterday}T08:31:00.000Z`,
      dateString: yesterday,
      servings: 1.5,
      servingGrams: 21,
      calories: 153,
      cholesterolMg: 46,
      saturatedFatG: 11.0,
      transFatG: 0.6,
      unsaturatedFatG: 5.5,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 0.1,
      carbsG: 0,
      sodiumMg: 136,
      swapSuggestion: 'Switch to Cold-Pressed Extra Virgin Olive Oil to eliminate dietary cholesterol and reduce saturated fat.',
    },
    {
      id: 'sample-y3',
      foodItemId: 'pork-bacon-cooked',
      foodName: 'Pork Bacon (Pan-fried, 2 slices)',
      category: 'meats_poultry',
      mealType: 'breakfast',
      timestamp: `${yesterday}T08:32:00.000Z`,
      dateString: yesterday,
      servings: 1.0,
      servingGrams: 16,
      calories: 86,
      cholesterolMg: 19,
      saturatedFatG: 2.8,
      transFatG: 0.1,
      unsaturatedFatG: 4.0,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 6.0,
      carbsG: 0.3,
      sodiumMg: 385,
    },

    // Two days ago: Moderate day
    {
      id: 'sample-t1',
      foodItemId: 'chicken-breast-skinless',
      foodName: 'Chicken Breast (Skinless, Roasted)',
      category: 'meats_poultry',
      mealType: 'dinner',
      timestamp: `${twoDaysAgo}T19:00:00.000Z`,
      dateString: twoDaysAgo,
      servings: 1.0,
      servingGrams: 113,
      calories: 186,
      cholesterolMg: 96,
      saturatedFatG: 1.0,
      transFatG: 0,
      unsaturatedFatG: 2.2,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 35.0,
      carbsG: 0,
      sodiumMg: 84,
    },
    {
      id: 'sample-t2',
      foodItemId: 'pearl-barley-cooked',
      foodName: 'Pearl Barley (Cooked)',
      category: 'grains_fiber',
      mealType: 'dinner',
      timestamp: `${twoDaysAgo}T19:05:00.000Z`,
      dateString: twoDaysAgo,
      servings: 1.0,
      servingGrams: 157,
      calories: 193,
      cholesterolMg: 0,
      saturatedFatG: 0.1,
      transFatG: 0,
      unsaturatedFatG: 0.5,
      solubleFiberG: 3.0,
      totalFiberG: 6.0,
      proteinG: 3.5,
      carbsG: 44.0,
      sodiumMg: 5,
    },
  ];
};

const generateSampleLipidPanels = (): LipidPanelEntry[] => {
  return [
    {
      id: 'lp-1',
      dateString: getOffsetDateString(-180),
      totalCholesterol: 238, // Borderline high
      ldl: 154, // Borderline high
      hdl: 42, // Normal
      triglycerides: 210, // High
      notes: 'Initial annual checkup. Doctor advised reducing saturated animal fats and increasing soluble fiber before initiating statins.',
    },
    {
      id: 'lp-2',
      dateString: getOffsetDateString(-90),
      totalCholesterol: 212,
      ldl: 131,
      hdl: 48,
      triglycerides: 165,
      notes: '3-month re-check. Swapped butter for EVOO and added daily steel-cut oats. Notable reduction in LDL and triglycerides.',
    },
    {
      id: 'lp-3',
      dateString: getOffsetDateString(-14),
      totalCholesterol: 178, // Desirable (<200)
      ldl: 96, // Optimal (<100)
      hdl: 56, // Healthy (>50)
      triglycerides: 130, // Normal (<150)
      notes: '6-month follow-up. Remarkable turnaround! LDL under 100 mg/dL target. Cardiologist congratulated strict adherence to dietary soluble fiber and low saturated fat.',
    },
  ];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [meals, setMeals] = useState<MealEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
      return saved ? JSON.parse(saved) : generateSampleMeals();
    } catch {
      return generateSampleMeals();
    }
  });

  const [lipidPanels, setLipidPanels] = useState<LipidPanelEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIPID_PANELS);
      return saved ? JSON.parse(saved) : generateSampleLipidPanels();
    } catch {
      return generateSampleLipidPanels();
    }
  });

  const [targets, setTargetsState] = useState<NutritionTargets>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
      return saved ? JSON.parse(saved) : TARGET_PRESETS.aha_high_risk.targets;
    } catch {
      return TARGET_PRESETS.aha_high_risk.targets;
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch (e) {
      console.error('Error saving meals:', e);
    }
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIPID_PANELS, JSON.stringify(lipidPanels));
    } catch (e) {
      console.error('Error saving lipid panels:', e);
    }
  }, [lipidPanels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
    } catch (e) {
      console.error('Error saving targets:', e);
    }
  }, [targets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(customFoods));
    } catch (e) {
      console.error('Error saving custom foods:', e);
    }
  }, [customFoods]);

  const allFoods: FoodItem[] = [...customFoods, ...USDA_FOOD_DATABASE];

  const addCustomFood = (foodData: Omit<FoodItem, 'id' | 'isCustom'>) => {
    const newFood: FoodItem = {
      ...foodData,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setCustomFoods(prev => [newFood, ...prev]);
  };

  const addMeal = (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const newEntry: MealEntry = {
      ...entry,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setMeals(prev => [newEntry, ...prev]);
  };

  const updateMeal = (id: string, updates: Partial<MealEntry>) => {
    setMeals(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const addLipidPanel = (entry: Omit<LipidPanelEntry, 'id'>) => {
    const newEntry: LipidPanelEntry = {
      ...entry,
      id: `lipid-${Date.now()}`,
    };
    setLipidPanels(prev => {
      const updated = [...prev, newEntry];
      return updated.sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime());
    });
  };

  const updateLipidPanel = (id: string, updates: Partial<LipidPanelEntry>) => {
    setLipidPanels(prev =>
      prev
        .map(p => (p.id === id ? { ...p, ...updates } : p))
        .sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime())
    );
  };

  const deleteLipidPanel = (id: string) => {
    setLipidPanels(prev => prev.filter(p => p.id !== id));
  };

  const setTargets = (newTargets: NutritionTargets) => {
    setTargetsState(newTargets);
  };

  const todaysMeals = meals.filter(m => m.dateString === selectedDate);

  const dayTotals = todaysMeals.reduce(
    (acc, m) => ({
      calories: Math.round(acc.calories + (m.calories || 0)),
      cholesterolMg: Math.round(acc.cholesterolMg + (m.cholesterolMg || 0)),
      saturatedFatG: Number((acc.saturatedFatG + (m.saturatedFatG || 0)).toFixed(1)),
      transFatG: Number((acc.transFatG + (m.transFatG || 0)).toFixed(1)),
      unsaturatedFatG: Number((acc.unsaturatedFatG + (m.unsaturatedFatG || 0)).toFixed(1)),
      solubleFiberG: Number((acc.solubleFiberG + (m.solubleFiberG || 0)).toFixed(1)),
      totalFiberG: Number((acc.totalFiberG + (m.totalFiberG || 0)).toFixed(1)),
      proteinG: Number((acc.proteinG + (m.proteinG || 0)).toFixed(1)),
      carbsG: Number((acc.carbsG + (m.carbsG || 0)).toFixed(1)),
      sodiumMg: Math.round(acc.sodiumMg + (m.sodiumMg || 0)),
    }),
    {
      calories: 0,
      cholesterolMg: 0,
      saturatedFatG: 0,
      transFatG: 0,
      unsaturatedFatG: 0,
      solubleFiberG: 0,
      totalFiberG: 0,
      proteinG: 0,
      carbsG: 0,
      sodiumMg: 0,
    }
  );

  const resetToSampleData = () => {
    const sampleMeals = generateSampleMeals();
    const sampleLipid = generateSampleLipidPanels();
    setMeals(sampleMeals);
    setLipidPanels(sampleLipid);
    setCustomFoods([]);
    setTargetsState(TARGET_PRESETS.aha_high_risk.targets);
    setSelectedDate(getTodayString());
  };

  const exportDataJson = () => {
    const payload = {
      app: 'AtheroTrack',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      targets,
      lipidPanels,
      meals,
      customFoods,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atherotrack-data-${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.meals)) {
        setMeals(parsed.meals);
      }
      if (Array.isArray(parsed.lipidPanels)) {
        setLipidPanels(parsed.lipidPanels);
      }
      if (parsed.targets) {
        setTargetsState(parsed.targets);
      }
      if (Array.isArray(parsed.customFoods)) {
        setCustomFoods(parsed.customFoods);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const exportCsvData = () => {
    const headers = [
      'Date',
      'Meal Type',
      'Food Item',
      'Category',
      'Servings',
      'Grams',
      'Calories (kcal)',
      'Cholesterol (mg)',
      'Saturated Fat (g)',
      'Trans Fat (g)',
      'Soluble Fiber (g)',
      'Total Fiber (g)',
      'Protein (g)',
      'Carbs (g)',
      'Sodium (mg)',
    ];

    const rows = meals.map(m => [
      m.dateString,
      m.mealType,
      `"${m.foodName.replace(/"/g, '""')}"`,
      m.category,
      m.servings,
      m.servingGrams,
      m.calories,
      m.cholesterolMg,
      m.saturatedFatG,
      m.transFatG,
      m.solubleFiberG,
      m.totalFiberG,
      m.proteinG,
      m.carbsG,
      m.sodiumMg,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atherotrack-nutrition-log-${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        foods: allFoods,
        addCustomFood,
        meals,
        todaysMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        lipidPanels,
        addLipidPanel,
        updateLipidPanel,
        deleteLipidPanel,
        targets,
        setTargets,
        dayTotals,
        resetToSampleData,
        exportDataJson,
        importDataJson,
        exportCsvData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
