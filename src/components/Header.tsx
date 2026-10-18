import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TARGET_PRESETS } from '../utils/cardiacCalculations';
import {
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  Sparkles,
  Download,
  Activity,
  Layers,
  Repeat,
  Smartphone,
  Github,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'diary' | 'lipid' | 'swaps';
  setCurrentTab: (tab: 'diary' | 'lipid' | 'swaps') => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onOpenFoodLogger: () => void;
  onOpenAndroidGitHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReport,
  onOpenSettings,
  onOpenFoodLogger,
  onOpenAndroidGitHub,
}) => {
  const { selectedDate, setSelectedDate, targets } = useApp();

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const d = new Date();
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  const formattedDate = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const currentPresetInfo = TARGET_PRESETS[targets.preset] || TARGET_PRESETS.aha_high_risk;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 flex items-center justify-center text-white shadow-sm ring-4 ring-rose-50">
              <Heart className="w-5 h-5 fill-white/90" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  AtheroTrack
                </span>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 hidden sm:inline-block">
                  Android & Web
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Dietary Cholesterol, Saturated Fat & Soluble Fiber Monitor
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCurrentTab('diary')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'diary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-4 h-4 text-rose-600" />
              <span>Diary</span>
            </button>
            <button
              onClick={() => setCurrentTab('lipid')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'lipid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Blood Lipids</span>
            </button>
            <button
              onClick={() => setCurrentTab('swaps')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'swaps'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Repeat className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Heart</span> Swaps
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Android & GitHub Button */}
            <button
              onClick={onOpenAndroidGitHub}
              title="Android App & GitHub Open Source Hub"
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-600" />
              <Github className="w-3.5 h-3.5 text-slate-800" />
              <span className="hidden lg:inline">Android & GitHub</span>
            </button>

            <button
              onClick={onOpenReport}
              title="Generate Physician Clinical Report"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Report</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Target Presets"
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-transparent transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenFoodLogger}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Log Food</span>
              <span className="sm:hidden">Log</span>
            </button>
          </div>
        </div>

        {/* Sub-bar with Date Navigator and Active Protocol */}
        {currentTab === 'diary' && (
          <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Date Navigator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">{formattedDate()}</span>
              </div>

              <button
                onClick={handleNextDay}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday() && (
                <button
                  onClick={handleToday}
                  className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  Jump to Today
                </button>
              )}
            </div>

            {/* Active Clinical Protocol summary */}
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-slate-400">Protocol:</span>
              <span className="font-semibold text-slate-800">{currentPresetInfo.title}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono">
                &lt;{targets.maxCholesterolMg}mg Chol / &lt;{targets.maxSaturatedFatG}g Sat Fat
              </span>
              <button
                onClick={onOpenSettings}
                className="text-rose-600 hover:underline font-semibold text-[11px] ml-1"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
