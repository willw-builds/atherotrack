import React from 'react';
import { useApp } from '../context/AppContext';
import { MealEntry, MealType } from '../types';
import {
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MealDiaryProps {
  onOpenAddFoodModal: (preselectedMeal: MealType) => void;
}

const MEAL_SECTIONS: { type: MealType; label: string; icon: React.ReactNode; subtitle: string }[] = [
  {
    type: 'breakfast',
    label: 'Breakfast',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
    subtitle: 'Kickstart LDL clearance with morning soluble fiber (oats, chia)',
  },
  {
    type: 'lunch',
    label: 'Lunch',
    icon: <Coffee className="w-4 h-4 text-sky-500" />,
    subtitle: 'Cardioprotective plant proteins & healthy unsaturated fats',
  },
  {
    type: 'dinner',
    label: 'Dinner',
    icon: <Sunset className="w-4 h-4 text-indigo-500" />,
    subtitle: 'Light proteins, steamed vegetables, and whole grains',
  },
  {
    type: 'snack',
    label: 'Snacks & Supplements',
    icon: <Moon className="w-4 h-4 text-emerald-500" />,
    subtitle: 'Raw nuts, seeds, fresh fruit with pectin',
  },
];

export const MealDiary: React.FC<MealDiaryProps> = ({ onOpenAddFoodModal }) => {
  const { todaysMeals, updateMeal, deleteMeal, foods, addMeal } = useApp();

  const handleAdjustServings = (meal: MealEntry, delta: number) => {
    const newServings = Math.max(0.25, Number((meal.servings + delta).toFixed(2)));
    const ratio = newServings / meal.servings;
    updateMeal(meal.id, {
      servings: newServings,
      servingGrams: Math.round(meal.servingGrams * ratio),
      calories: Math.round(meal.calories * ratio),
      cholesterolMg: Math.round(meal.cholesterolMg * ratio),
      saturatedFatG: Number((meal.saturatedFatG * ratio).toFixed(1)),
      transFatG: Number((meal.transFatG * ratio).toFixed(1)),
      unsaturatedFatG: Number((meal.unsaturatedFatG * ratio).toFixed(1)),
      solubleFiberG: Number((meal.solubleFiberG * ratio).toFixed(1)),
      totalFiberG: Number((meal.totalFiberG * ratio).toFixed(1)),
      proteinG: Number((meal.proteinG * ratio).toFixed(1)),
      carbsG: Number((meal.carbsG * ratio).toFixed(1)),
      sodiumMg: Math.round(meal.sodiumMg * ratio),
    });
  };

  // 1-Click Cardioprotective Swap Handler
  const handleApplyHeartSwap = (meal: MealEntry) => {
    // Determine the smart swap replacement based on the logged item
    let targetFoodId = 'egg-white';
    let targetServings = 2;
    let targetNotes = 'Heart Swap applied';

    if (meal.foodItemId.includes('egg') || meal.foodName.toLowerCase().includes('egg')) {
      targetFoodId = 'egg-white';
      targetServings = 2;
      targetNotes = 'Swapped whole eggs for 2 egg whites to remove 372mg cholesterol';
    } else if (meal.foodItemId.includes('butter') || meal.foodName.toLowerCase().includes('butter')) {
      targetFoodId = 'extra-virgin-olive-oil';
      targetServings = 1;
      targetNotes = 'Swapped butter for extra virgin olive oil to replace saturated fat with oleic acid';
    } else if (meal.foodItemId.includes('beef') || meal.foodItemId.includes('steak') || meal.foodItemId.includes('ribeye')) {
      targetFoodId = 'salmon-wild-atlantic';
      targetServings = 1;
      targetNotes = 'Swapped red meat for wild salmon to supply EPA/DHA Omega-3';
    } else if (meal.foodItemId.includes('bacon') || meal.foodItemId.includes('sausage')) {
      targetFoodId = 'tempeh-organic';
      targetServings = 1;
      targetNotes = 'Swapped processed pork for organic tempeh to eliminate cholesterol';
    } else if (meal.foodItemId.includes('cheese') || meal.foodItemId.includes('cheddar')) {
      targetFoodId = 'mozzarella-part-skim';
      targetServings = 1;
      targetNotes = 'Swapped full fat cheddar for part-skim mozzarella';
    } else {
      targetFoodId = 'steel-cut-oats';
      targetServings = 1;
      targetNotes = 'Swapped for high soluble fiber oats';
    }

    const swapFood = foods.find(f => f.id === targetFoodId) || foods[1]; // fallback

    // Delete the original high-cholesterol entry
    deleteMeal(meal.id);

    // Add the heart-healthy replacement
    addMeal({
      foodItemId: swapFood.id,
      foodName: swapFood.name,
      category: swapFood.category,
      mealType: meal.mealType,
      dateString: meal.dateString,
      servings: targetServings,
      servingGrams: swapFood.servingGrams * targetServings,
      calories: swapFood.calories * targetServings,
      cholesterolMg: swapFood.cholesterolMg * targetServings,
      saturatedFatG: Number((swapFood.saturatedFatG * targetServings).toFixed(1)),
      transFatG: Number((swapFood.transFatG * targetServings).toFixed(1)),
      unsaturatedFatG: Number((swapFood.unsaturatedFatG * targetServings).toFixed(1)),
      solubleFiberG: Number((swapFood.solubleFiberG * targetServings).toFixed(1)),
      totalFiberG: Number((swapFood.totalFiberG * targetServings).toFixed(1)),
      proteinG: Number((swapFood.proteinG * targetServings).toFixed(1)),
      carbsG: Number((swapFood.carbsG * targetServings).toFixed(1)),
      sodiumMg: swapFood.sodiumMg * targetServings,
      swapSuggestion: undefined,
    });

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#f43f5e'],
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {MEAL_SECTIONS.map(section => {
        const sectionMeals = todaysMeals.filter(m => m.mealType === section.type);
        const sectionTotals = sectionMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            cholesterolMg: acc.cholesterolMg + m.cholesterolMg,
            saturatedFatG: Number((acc.saturatedFatG + m.saturatedFatG).toFixed(1)),
            solubleFiberG: Number((acc.solubleFiberG + m.solubleFiberG).toFixed(1)),
          }),
          { calories: 0, cholesterolMg: 0, saturatedFatG: 0, solubleFiberG: 0 }
        );

        return (
          <div key={section.type} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Meal Header */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{section.label}</h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">{section.subtitle}</p>
                </div>
              </div>

              {/* Meal Summary Metrics */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
                <div className="text-slate-600">
                  <span className="font-bold text-slate-900">{sectionTotals.calories}</span> kcal
                </div>
                <div className={sectionTotals.cholesterolMg > 100 ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                  <span className="font-bold">{sectionTotals.cholesterolMg}</span> mg Chol
                </div>
                <div className={sectionTotals.saturatedFatG > 4 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                  <span className="font-bold">{sectionTotals.saturatedFatG}</span>g Sat Fat
                </div>
                <div className={sectionTotals.solubleFiberG >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                  <span className="font-bold">{sectionTotals.solubleFiberG}</span>g Sol Fiber
                </div>

                <button
                  onClick={() => onOpenAddFoodModal(section.type)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors ml-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Meal Food Items List */}
            {sectionMeals.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-slate-400">No foods logged for {section.label.toLowerCase()} yet.</p>
                <button
                  onClick={() => onOpenAddFoodModal(section.type)}
                  className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log food or scan meal
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sectionMeals.map(meal => {
                  const isHighCholesterol = meal.cholesterolMg >= 60;
                  const isHighSatFat = meal.saturatedFatG >= 3.5;

                  return (
                    <div key={meal.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Food info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{meal.foodName}</span>
                            {meal.category && (
                              <span className="text-[11px] text-slate-400 capitalize">
                                · {meal.category.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                            <span>
                              {meal.servings}x serving ({meal.servingGrams}g)
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>{meal.calories} kcal</span>
                            <span className="text-slate-300">|</span>
                            <span>P: {meal.proteinG}g</span>
                            <span className="text-slate-300">|</span>
                            <span>C: {meal.carbsG}g</span>
                          </div>
                        </div>

                        {/* Lipid & Fiber Metrics + Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          {/* 3 Core Heart Metrics */}
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <div className={`px-2 py-1 rounded-md text-center ${
                              isHighCholesterol
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-50 text-slate-700'
                            }`}>
                              <div className="text-[10px] text-slate-400 uppercase font-sans">Cholesterol</div>
                              <span className="font-bold">{meal.cholesterolMg} mg</span>
                            </div>

                            <div className={`px-2 py-1 rounded-md text-center ${
                              isHighSatFat
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-50 text-slate-700'
                            }`}>
                              <div className="text-[10px] text-slate-400 uppercase font-sans">Sat Fat</div>
                              <span className="font-bold">{meal.saturatedFatG} g</span>
                            </div>

                            <div className={`px-2 py-1 rounded-md text-center ${
                              meal.solubleFiberG >= 1.5
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-50 text-slate-700'
                            }`}>
                              <div className="text-[10px] text-slate-400 uppercase font-sans">Sol Fiber</div>
                              <span className="font-bold">{meal.solubleFiberG} g</span>
                            </div>
                          </div>

                          {/* Servings Multiplier Buttons */}
                          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                            <button
                              onClick={() => handleAdjustServings(meal, -0.5)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold hover:bg-white rounded transition-colors"
                              title="Decrease 0.5x"
                            >
                              -
                            </button>
                            <span className="px-1 text-xs font-mono font-medium text-slate-800">
                              {meal.servings}x
                            </span>
                            <button
                              onClick={() => handleAdjustServings(meal, 0.5)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold hover:bg-white rounded transition-colors"
                              title="Increase 0.5x"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove food"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Cardioprotective Swap Recommendation Banner */}
                      {(isHighCholesterol || isHighSatFat || meal.swapSuggestion) && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-amber-800">Heart Shield Swap Opportunity: </span>
                              <span>
                                {meal.swapSuggestion || 'High saturated fat or cholesterol intake detected. Swap with plant-based or low-fat alternatives to protect vascular endothelium.'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyHeartSwap(meal)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-2xs transition-colors self-start sm:self-auto"
                          >
                            <span>1-Click Swap</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
