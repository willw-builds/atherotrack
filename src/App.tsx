import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NutritionGauges } from './components/NutritionGauges';
import { MealDiary } from './components/MealDiary';
import { LipidTrackerView } from './components/LipidTrackerView';
import { HeartSwapsGuideView } from './components/HeartSwapsGuideView';
import { FoodLoggerModal } from './components/FoodLoggerModal';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { AndroidGitHubModal } from './components/AndroidGitHubModal';
import { MealType } from './types';
import {
  Heart,
  ShieldCheck,
  Info,
  Activity,
  Sparkles,
  BookOpen,
} from 'lucide-react';

function Dashboard() {
  const [currentTab, setCurrentTab] = useState<'diary' | 'lipid' | 'swaps'>('diary');
  const [isFoodLoggerOpen, setIsFoodLoggerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidGitHubOpen, setIsAndroidGitHubOpen] = useState(false);
  const [preselectedMeal, setPreselectedMeal] = useState<MealType>('breakfast');

  const handleOpenAddFood = (mealType: MealType = 'breakfast') => {
    setPreselectedMeal(mealType);
    setIsFoodLoggerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Android Install Banner for mobile users */}
      <AndroidInstallBanner onOpenAndroidModal={() => setIsAndroidGitHubOpen(true)} />

      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFoodLogger={() => handleOpenAddFood('breakfast')}
        onOpenAndroidGitHub={() => setIsAndroidGitHubOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'diary' && (
          <div className="space-y-6">
            <NutritionGauges />
            <MealDiary onOpenAddFoodModal={handleOpenAddFood} />
          </div>
        )}

        {currentTab === 'lipid' && <LipidTrackerView />}

        {currentTab === 'swaps' && <HeartSwapsGuideView />}
      </main>

      {/* Clinical Reference & Educational Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Cardiovascular Science Notes</span>
              </div>
              <p className="leading-relaxed">
                Dietary cholesterol and saturated fat affect cardiovascular risk differently. While dietary cholesterol contributes to total intake, saturated fatty acids have a much larger impact by downregulating hepatic LDL receptors.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>The Soluble Fiber Mechanism</span>
              </div>
              <p className="leading-relaxed">
                Viscous soluble fibers (oat beta-glucans, pectin, psyllium, legumes) bind cholesterol-rich bile acids in the intestine, prompting the liver to draw LDL from the blood to synthesize new bile, actively lowering circulating LDL.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Clinical Guidelines</span>
              </div>
              <p className="leading-relaxed">
                Target ranges are grounded in the American Heart Association (AHA) and NCEP ATP III guidelines: LDL &lt; 100 mg/dL, Total Cholesterol &lt; 200 mg/dL, and Saturated Fat &lt; 5-6% of calories.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              AtheroTrack · Open Source Android & Web Cholesterol Tracker.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAndroidGitHubOpen(true)}
                className="text-rose-600 hover:underline font-semibold"
              >
                Android & GitHub Hub
              </button>
              <span>·</span>
              <span>Data stored privately in browser local storage.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FoodLoggerModal
        isOpen={isFoodLoggerOpen}
        onClose={() => setIsFoodLoggerOpen(false)}
        initialMealType={preselectedMeal}
      />

      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AndroidGitHubModal
        isOpen={isAndroidGitHubOpen}
        onClose={() => setIsAndroidGitHubOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
