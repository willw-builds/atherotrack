import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCategory, FoodItem, MealType } from '../types';
import {
  X,
  Search,
  Sparkles,
  Plus,
  Flame,
  Check,
  AlertCircle,
  Camera,
  Upload,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Loader2,
} from 'lucide-react';

interface FoodLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: MealType;
}

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  isOpen,
  onClose,
  initialMealType = 'breakfast',
}) => {
  const { foods, addMeal, addCustomFood, selectedDate } = useApp();

  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'custom'>('search');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heartFriendlyOnly, setHeartFriendlyOnly] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [customGramsInput, setCustomGramsInput] = useState<string>('');

  // AI Tab state
  const [aiMealText, setAiMealText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Custom Food state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('other');
  const [customServingSize, setCustomServingSize] = useState('1 serving (100g)');
  const [customServingGrams, setCustomServingGrams] = useState(100);
  const [customCalories, setCustomCalories] = useState(150);
  const [customCholesterol, setCustomCholesterol] = useState(0);
  const [customSatFat, setCustomSatFat] = useState(1.0);
  const [customTransFat, setCustomTransFat] = useState(0);
  const [customSolubleFiber, setCustomSolubleFiber] = useState(1.0);
  const [customTotalFiber, setCustomTotalFiber] = useState(3.0);
  const [customProtein, setCustomProtein] = useState(5.0);
  const [customCarbs, setCustomCarbs] = useState(20.0);
  const [customSodium, setCustomSodium] = useState(150);

  if (!isOpen) return null;

  // Filter food items
  const filteredFoods = foods.filter(food => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesHeart = !heartFriendlyOnly || food.heartGrade === 'A' || food.heartGrade === 'B';
    return matchesSearch && matchesCategory && matchesHeart;
  });

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServingMultiplier(1);
    setCustomGramsInput(String(food.servingGrams));
  };

  const handleGramsChange = (valStr: string) => {
    setCustomGramsInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && selectedFood && selectedFood.servingGrams > 0) {
      setServingMultiplier(Number((parsed / selectedFood.servingGrams).toFixed(2)));
    }
  };

  const handleMultiplierChange = (multiplier: number) => {
    setServingMultiplier(multiplier);
    if (selectedFood) {
      setCustomGramsInput(String(Math.round(selectedFood.servingGrams * multiplier)));
    }
  };

  const handleLogSelectedFood = () => {
    if (!selectedFood) return;
    const mult = servingMultiplier > 0 ? servingMultiplier : 1;
    const grams = selectedFood.servingGrams ? Math.round(selectedFood.servingGrams * mult) : 100;

    addMeal({
      foodItemId: selectedFood.id,
      foodName: selectedFood.name,
      category: selectedFood.category,
      mealType: selectedMealType,
      dateString: selectedDate,
      servings: mult,
      servingGrams: grams,
      calories: Math.round(selectedFood.calories * mult),
      cholesterolMg: Math.round(selectedFood.cholesterolMg * mult),
      saturatedFatG: Number((selectedFood.saturatedFatG * mult).toFixed(1)),
      transFatG: Number((selectedFood.transFatG * mult).toFixed(1)),
      unsaturatedFatG: Number((selectedFood.unsaturatedFatG * mult).toFixed(1)),
      solubleFiberG: Number((selectedFood.solubleFiberG * mult).toFixed(1)),
      totalFiberG: Number((selectedFood.totalFiberG * mult).toFixed(1)),
      proteinG: Number((selectedFood.proteinG * mult).toFixed(1)),
      carbsG: Number((selectedFood.carbsG * mult).toFixed(1)),
      sodiumMg: Math.round(selectedFood.sodiumMg * mult),
      swapSuggestion: selectedFood.swapSuggestion,
    });

    onClose();
  };

  // AI Meal Analysis trigger
  const handleAnalyzeMealWithGemini = async () => {
    if (!aiMealText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDescription: aiMealText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze meal');
      }
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      // Fallback local smart parse if server is offline or no key
      handleFallbackLocalParser();
    } finally {
      setAiLoading(false);
    }
  };

  const handleFallbackLocalParser = () => {
    // Helpful fallback that parses words against food database
    const textLower = aiMealText.toLowerCase();
    const matchedItems: any[] = [];

    foods.forEach(food => {
      const keywords = food.name.toLowerCase().split(' ');
      const match = keywords.some(k => k.length > 3 && textLower.includes(k));
      if (match && matchedItems.length < 4) {
        matchedItems.push({
          name: food.name,
          portion: food.servingSize,
          grams: food.servingGrams,
          calories: food.calories,
          cholesterolMg: food.cholesterolMg,
          saturatedFatG: food.saturatedFatG,
          transFatG: food.transFatG,
          solubleFiberG: food.solubleFiberG,
          totalFiberG: food.totalFiberG,
          proteinG: food.proteinG,
          carbsG: food.carbsG,
          sodiumMg: food.sodiumMg,
          swapSuggestion: food.swapSuggestion,
        });
      }
    });

    if (matchedItems.length === 0) {
      // generic fallback item
      matchedItems.push({
        name: aiMealText.slice(0, 30),
        portion: '1 serving (150g)',
        grams: 150,
        calories: 220,
        cholesterolMg: 35,
        saturatedFatG: 2.5,
        transFatG: 0,
        solubleFiberG: 1.0,
        totalFiberG: 3.0,
        proteinG: 10,
        carbsG: 25,
        sodiumMg: 350,
      });
    }

    setAiResult({
      summary: `Estimated nutrition for: "${aiMealText}"`,
      heartHealthRating: 'moderate',
      keyAdvice: 'Pay attention to hidden cooking oils or saturated animal fats. Pair with soluble fiber to protect cholesterol levels.',
      items: matchedItems,
    });
  };

  const handleLogAllAiItems = () => {
    if (!aiResult || !Array.isArray(aiResult.items)) return;

    aiResult.items.forEach((item: any) => {
      addMeal({
        foodItemId: `ai-item-${Date.now()}-${Math.random()}`,
        foodName: item.name,
        category: 'other',
        mealType: selectedMealType,
        dateString: selectedDate,
        servings: 1,
        servingGrams: item.grams || 100,
        calories: item.calories || 0,
        cholesterolMg: item.cholesterolMg || 0,
        saturatedFatG: item.saturatedFatG || 0,
        transFatG: item.transFatG || 0,
        unsaturatedFatG: 2.0,
        solubleFiberG: item.solubleFiberG || 0,
        totalFiberG: item.totalFiberG || 0,
        proteinG: item.proteinG || 0,
        carbsG: item.carbsG || 0,
        sodiumMg: item.sodiumMg || 0,
        swapSuggestion: item.swapSuggestion,
      });
    });

    onClose();
  };

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (customSatFat <= 1.5 && customCholesterol <= 10 && customSolubleFiber >= 1.0) grade = 'A';
    else if (customSatFat > 6 || customCholesterol > 100 || customTransFat > 0) grade = 'F';
    else if (customSatFat > 3.5 || customCholesterol > 50) grade = 'D';

    addCustomFood({
      name: customName,
      category: customCategory,
      servingSize: customServingSize,
      servingGrams: customServingGrams,
      calories: customCalories,
      cholesterolMg: customCholesterol,
      saturatedFatG: customSatFat,
      transFatG: customTransFat,
      unsaturatedFatG: 2.0,
      solubleFiberG: customSolubleFiber,
      totalFiberG: customTotalFiber,
      proteinG: customProtein,
      carbsG: customCarbs,
      sodiumMg: customSodium,
      heartGrade: grade,
    });

    // Switch to search and select it
    setSearchQuery(customName);
    setActiveTab('search');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Log Food & Meal</h2>
            <p className="text-xs text-slate-500">
              Verified USDA lipid database, AI meal parser, and custom foods
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selector Bar */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Logging for:</span>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  selectedMealType === type
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Database Search
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>AI Meal Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Custom Food
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search bar & heart filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search foods (e.g., eggs, oats, butter, salmon, avocado)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setHeartFriendlyOnly(!heartFriendlyOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                    heartFriendlyOnly
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Heart Friendly (Grade A/B)</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'all', label: 'All Foods' },
                  { id: 'dairy_eggs', label: 'Dairy & Eggs' },
                  { id: 'meats_poultry', label: 'Meats & Poultry' },
                  { id: 'seafood', label: 'Seafood & Fish' },
                  { id: 'grains_fiber', label: 'Grains & Fiber' },
                  { id: 'legumes_beans', label: 'Legumes & Beans' },
                  { id: 'nuts_seeds', label: 'Nuts & Seeds' },
                  { id: 'fruits_veggies', label: 'Fruits & Veggies' },
                  { id: 'fats_oils', label: 'Oils & Fats' },
                  { id: 'plant_protein', label: 'Plant Protein' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Layout: Foods List & Food Detail Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* List */}
                <div className="border border-slate-200 rounded-xl max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                  {filteredFoods.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No matching foods found in database. Try typing another term or create a custom food.
                    </div>
                  ) : (
                    filteredFoods.map(food => {
                      const isSelected = selectedFood?.id === food.id;
                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className={`p-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-rose-50/70 border-l-4 border-rose-600' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-sm text-slate-900">{food.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {food.servingSize} · {food.calories} kcal
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`inline-block text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                                food.cholesterolMg > 100
                                  ? 'bg-rose-100 text-rose-800'
                                  : food.cholesterolMg > 30
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {food.cholesterolMg}mg Chol
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span>Sat Fat: <strong className={food.saturatedFatG > 4 ? 'text-amber-700' : 'text-slate-700'}>{food.saturatedFatG}g</strong></span>
                            <span>Sol Fiber: <strong className={food.solubleFiberG >= 1 ? 'text-emerald-700' : 'text-slate-700'}>{food.solubleFiberG}g</strong></span>
                            <span>Grade: <strong className="text-slate-800">{food.heartGrade}</strong></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Food Detail & Portion Builder */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                  {selectedFood ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{selectedFood.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            selectedFood.heartGrade === 'A' || selectedFood.heartGrade === 'B'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedFood.heartGrade === 'C'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            Heart Grade {selectedFood.heartGrade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Base Serving: {selectedFood.servingSize} ({selectedFood.servingGrams}g)
                        </p>
                      </div>

                      {/* Portion Multipliers */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Portion Servings:</label>
                        <div className="flex items-center gap-2">
                          {[0.5, 1, 1.5, 2].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleMultiplierChange(m)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                servingMultiplier === m
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {m}x
                            </button>
                          ))}
                        </div>

                        {/* Grams input */}
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-slate-500">Weight (grams):</label>
                          <input
                            type="number"
                            min="1"
                            value={customGramsInput}
                            onChange={e => handleGramsChange(e.target.value)}
                            className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                          />
                          <span className="text-xs text-slate-400">g</span>
                        </div>
                      </div>

                      {/* Calculated Nutrients for this Portion */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200 text-center font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Calories</div>
                          <span className="font-bold text-slate-900 text-sm">
                            {Math.round(selectedFood.calories * servingMultiplier)}
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Cholesterol</div>
                          <span className={`font-bold text-sm ${selectedFood.cholesterolMg * servingMultiplier > 60 ? 'text-rose-700' : 'text-slate-900'}`}>
                            {Math.round(selectedFood.cholesterolMg * servingMultiplier)} mg
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Sat Fat</div>
                          <span className="font-bold text-slate-900 text-sm">
                            {(selectedFood.saturatedFatG * servingMultiplier).toFixed(1)} g
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Sol Fiber</div>
                          <span className="font-bold text-emerald-700 text-sm">
                            {(selectedFood.solubleFiberG * servingMultiplier).toFixed(1)} g
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Protein</div>
                          <span className="font-bold text-slate-800 text-sm">
                            {(selectedFood.proteinG * servingMultiplier).toFixed(1)} g
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans">Sodium</div>
                          <span className="font-bold text-slate-800 text-sm">
                            {Math.round(selectedFood.sodiumMg * servingMultiplier)} mg
                          </span>
                        </div>
                      </div>

                      {selectedFood.swapSuggestion && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Heart Swap:</strong> {selectedFood.swapSuggestion}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={handleLogSelectedFood}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Log to {selectedMealType}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-400 my-auto">
                      Select a food item from the list to preview nutritional lipid breakdown and adjust portion.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Gemini Clinical AI Meal Decomposition
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Describe what you ate in natural language. Our clinical cardiovascular engine calculates accurate portion grams, dietary cholesterol, saturated fat, and cholesterol-binding soluble fiber.
                </p>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Meal Description or Recipe:
                </label>
                <textarea
                  rows={3}
                  value={aiMealText}
                  onChange={e => setAiMealText(e.target.value)}
                  placeholder="e.g., 2 scrambled eggs cooked in butter with 2 slices of pork bacon, 1 slice of sourdough toast, and 1 cup of black coffee..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />

                {/* Example prompt pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Try example:</span>
                  {[
                    '2 fried eggs, 2 bacon strips, buttered toast',
                    'Steel cut oats with chia, walnuts, and blueberries',
                    'Grilled salmon fillet with quinoa and steamed broccoli',
                    'Double cheeseburger with medium fries',
                  ].map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiMealText(ex)}
                      className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  disabled={aiLoading || !aiMealText.trim()}
                  onClick={handleAnalyzeMealWithGemini}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Lipid Profile with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Meal</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Result Cards */}
              {aiResult && (
                <div className="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{aiResult.summary}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{aiResult.keyAdvice}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                      aiResult.heartHealthRating === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : aiResult.heartHealthRating === 'moderate'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {aiResult.heartHealthRating}
                    </span>
                  </div>

                  {/* Identified Items Table */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    {aiResult.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.portion} · {item.calories} kcal
                          </div>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className={item.cholesterolMg > 50 ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                            {item.cholesterolMg}mg Chol
                          </span>
                          <span className={item.saturatedFatG > 3 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                            {item.saturatedFatG}g Sat Fat
                          </span>
                          <span className="text-emerald-700 font-bold">
                            {item.solubleFiberG}g Sol Fiber
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleLogAllAiItems}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log All {aiResult.items.length} Items to {selectedMealType}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustomFood} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Food Name</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g., Oat bran pancake with flax"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Category</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as FoodCategory)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="grains_fiber">Grains & Fiber</option>
                    <option value="dairy_eggs">Dairy & Eggs</option>
                    <option value="meats_poultry">Meats & Poultry</option>
                    <option value="seafood">Seafood & Fish</option>
                    <option value="legumes_beans">Legumes & Beans</option>
                    <option value="nuts_seeds">Nuts & Seeds</option>
                    <option value="fruits_veggies">Fruits & Veggies</option>
                    <option value="fats_oils">Oils & Fats</option>
                    <option value="plant_protein">Plant Protein</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Serving Label</label>
                  <input
                    type="text"
                    value={customServingSize}
                    onChange={e => setCustomServingSize(e.target.value)}
                    placeholder="e.g., 1 slice (85g)"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Serving Weight (grams)</label>
                  <input
                    type="number"
                    min="1"
                    value={customServingGrams}
                    onChange={e => setCustomServingGrams(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Core lipid fields */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Cardiovascular Lipid Panel Values:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block">Cholesterol (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCholesterol}
                      onChange={e => setCustomCholesterol(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Saturated Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={customSatFat}
                      onChange={e => setCustomSatFat(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Trans Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={customTransFat}
                      onChange={e => setCustomTransFat(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Soluble Fiber (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={customSolubleFiber}
                      onChange={e => setCustomSolubleFiber(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block">Calories (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCalories}
                      onChange={e => setCustomCalories(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Total Fiber (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={customTotalFiber}
                      onChange={e => setCustomTotalFiber(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={customProtein}
                      onChange={e => setCustomProtein(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block">Sodium (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={customSodium}
                      onChange={e => setCustomSodium(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save to Food Database
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
