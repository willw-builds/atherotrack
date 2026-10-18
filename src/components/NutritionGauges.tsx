import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateAtheroRiskScore } from '../utils/cardiacCalculations';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  Flame,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const NutritionGauges: React.FC = () => {
  const { dayTotals, targets } = useApp();

  const cholPercent = Math.min(200, Math.round((dayTotals.cholesterolMg / targets.maxCholesterolMg) * 100));
  const satFatPercent = Math.min(200, Math.round((dayTotals.saturatedFatG / targets.maxSaturatedFatG) * 100));
  const fiberPercent = Math.min(200, Math.round((dayTotals.solubleFiberG / targets.minSolubleFiberG) * 100));

  const atheroRisk = calculateAtheroRiskScore(
    dayTotals.cholesterolMg,
    dayTotals.saturatedFatG,
    dayTotals.transFatG,
    dayTotals.solubleFiberG,
    targets
  );

  // Status color logic for limits (where lower is better)
  const getLimitColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio <= 0.75) return { text: 'text-emerald-700', bg: 'bg-emerald-500', track: 'bg-emerald-100', border: 'border-emerald-200' };
    if (ratio <= 1.0) return { text: 'text-amber-700', bg: 'bg-amber-500', track: 'bg-amber-100', border: 'border-amber-200' };
    return { text: 'text-rose-700', bg: 'bg-rose-600', track: 'bg-rose-100', border: 'border-rose-200' };
  };

  // Status color logic for goals (where higher is better)
  const getGoalColor = (current: number, min: number) => {
    const ratio = current / min;
    if (ratio >= 1.0) return { text: 'text-emerald-700', bg: 'bg-emerald-500', track: 'bg-emerald-100', border: 'border-emerald-200' };
    if (ratio >= 0.6) return { text: 'text-sky-700', bg: 'bg-sky-500', track: 'bg-sky-100', border: 'border-sky-200' };
    return { text: 'text-slate-700', bg: 'bg-slate-400', track: 'bg-slate-100', border: 'border-slate-200' };
  };

  const cholColor = getLimitColor(dayTotals.cholesterolMg, targets.maxCholesterolMg);
  const satFatColor = getLimitColor(dayTotals.saturatedFatG, targets.maxSaturatedFatG);
  const fiberColor = getGoalColor(dayTotals.solubleFiberG, targets.minSolubleFiberG);

  const getRiskBadge = () => {
    switch (atheroRisk.level) {
      case 'optimal':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        };
      case 'moderate':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: <Info className="w-4 h-4 text-sky-600" />,
        };
      case 'elevated':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'critical':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
        };
    }
  };

  const riskBadge = getRiskBadge();

  return (
    <div className="space-y-4">
      {/* Cardiovascular Health Risk Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-xl border ${riskBadge.bg} flex items-center justify-center shrink-0`}>
              {riskBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Daily AtheroRisk Index
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${riskBadge.bg}`}>
                  {atheroRisk.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {atheroRisk.advice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 shrink-0 self-start md:self-auto">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Athero Score</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-slate-900">{atheroRisk.score}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    atheroRisk.level === 'optimal'
                      ? 'text-emerald-500'
                      : atheroRisk.level === 'moderate'
                      ? 'text-sky-500'
                      : atheroRisk.level === 'elevated'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  strokeDasharray={`${atheroRisk.score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700">
                {atheroRisk.score}%
              </span>
            </div>
          </div>
        </div>

        {/* Trans Fat alert if any */}
        {dayTotals.transFatG > 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Trans Fat Detected ({dayTotals.transFatG}g):</strong> Trans fatty acids directly increase LDL-C and suppress protective HDL-C. Clinical target is strictly 0g.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Core Cardiovascular Pill Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dietary Cholesterol Gauge */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
          dayTotals.cholesterolMg > targets.maxCholesterolMg ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dietary Cholesterol
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`font-mono text-2xl font-extrabold ${cholColor.text}`}>
                  {dayTotals.cholesterolMg}
                </span>
                <span className="text-xs text-slate-400">/ {targets.maxCholesterolMg} mg</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${cholColor.text}`}>
                {cholPercent}%
              </span>
              <div className="text-[11px] text-slate-500">
                {dayTotals.cholesterolMg <= targets.maxCholesterolMg ? (
                  <span>{targets.maxCholesterolMg - dayTotals.cholesterolMg} mg left</span>
                ) : (
                  <span className="text-rose-600 font-semibold">+{dayTotals.cholesterolMg - targets.maxCholesterolMg} mg excess</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div className={`w-full h-2.5 rounded-full mt-3 overflow-hidden ${cholColor.track}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${cholColor.bg}`}
              style={{ width: `${Math.min(100, cholPercent)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Limit: {targets.maxCholesterolMg} mg</span>
            <span className="text-slate-400">Primary: Egg yolks, offal, shrimp</span>
          </div>
        </div>

        {/* Saturated Fat Gauge */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
          dayTotals.saturatedFatG > targets.maxSaturatedFatG ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saturated Fat (LDL Driver)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`font-mono text-2xl font-extrabold ${satFatColor.text}`}>
                  {dayTotals.saturatedFatG}
                </span>
                <span className="text-xs text-slate-400">/ {targets.maxSaturatedFatG} g</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${satFatColor.text}`}>
                {satFatPercent}%
              </span>
              <div className="text-[11px] text-slate-500">
                {dayTotals.saturatedFatG <= targets.maxSaturatedFatG ? (
                  <span>{(targets.maxSaturatedFatG - dayTotals.saturatedFatG).toFixed(1)} g left</span>
                ) : (
                  <span className="text-rose-600 font-semibold">+{(dayTotals.saturatedFatG - targets.maxSaturatedFatG).toFixed(1)} g over</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div className={`w-full h-2.5 rounded-full mt-3 overflow-hidden ${satFatColor.track}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${satFatColor.bg}`}
              style={{ width: `${Math.min(100, satFatPercent)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>&lt; 5-6% total calories</span>
            <span className="text-slate-400">Butter, fatty meat, cheese</span>
          </div>
        </div>

        {/* Soluble Fiber Gauge (The Heart Shield) */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
          dayTotals.solubleFiberG >= targets.minSolubleFiberG ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-100' : 'border-slate-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Soluble Fiber (Heart Shield)
                </span>
                {dayTotals.solubleFiberG >= targets.minSolubleFiberG && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`font-mono text-2xl font-extrabold ${fiberColor.text}`}>
                  {dayTotals.solubleFiberG}
                </span>
                <span className="text-xs text-slate-400">/ {targets.minSolubleFiberG} g target</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${fiberColor.text}`}>
                {fiberPercent}%
              </span>
              <div className="text-[11px] text-slate-500">
                {dayTotals.solubleFiberG >= targets.minSolubleFiberG ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1 justify-end">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Goal Reached!
                  </span>
                ) : (
                  <span>{(targets.minSolubleFiberG - dayTotals.solubleFiberG).toFixed(1)} g needed</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div className={`w-full h-2.5 rounded-full mt-3 overflow-hidden ${fiberColor.track}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${fiberColor.bg}`}
              style={{ width: `${Math.min(100, fiberPercent)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Binds digestive LDL bile</span>
            <span className="text-slate-400">Oats, chia, beans, barley</span>
          </div>
        </div>
      </div>

      {/* Secondary Nutritional Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-2xl border border-slate-200 p-4">
        <div>
          <span className="text-[11px] font-medium text-slate-500">Calories</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-lg font-bold text-slate-900">{dayTotals.calories}</span>
            <span className="text-xs text-slate-400">/ {targets.targetCalories} kcal</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-slate-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (dayTotals.calories / targets.targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500">Healthy Unsaturated Fat</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-lg font-bold text-emerald-700">{dayTotals.unsaturatedFatG}g</span>
            <span className="text-xs text-slate-400">MUFA/PUFA</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">EVOO, nuts, salmon, avocado</div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500">Total Dietary Fiber</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-lg font-bold text-sky-700">{dayTotals.totalFiberG}g</span>
            <span className="text-xs text-slate-400">/ {targets.minTotalFiberG}g goal</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{(dayTotals.totalFiberG - dayTotals.solubleFiberG).toFixed(1)}g insoluble</div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500">Sodium</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-mono text-lg font-bold ${dayTotals.sodiumMg > targets.maxSodiumMg ? 'text-amber-700' : 'text-slate-900'}`}>
              {dayTotals.sodiumMg}
            </span>
            <span className="text-xs text-slate-400">/ {targets.maxSodiumMg} mg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cardiovascular vascular tone</div>
        </div>
      </div>
    </div>
  );
};
