import React, { useState } from 'react';
import { HEART_HEALTHY_SWAPS } from '../data/heartHealthySwaps';
import {
  Repeat,
  Sparkles,
  ArrowRight,
  Search,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const HeartSwapsGuideView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSwaps = HEART_HEALTHY_SWAPS.filter(swap =>
    swap.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swap.swapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swap.benefitDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
                <Repeat className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">Heart Shield Cardioprotective Swaps</h2>
            </div>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Clinical research demonstrates that replacing saturated animal fats with plant-derived unsaturated fats and soluble viscous fiber lowers circulating LDL-C by 10% to 28% without sacrificing culinary enjoyment.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mt-5 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search swaps (e.g. eggs, butter, ribeye, ice cream)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/40"
          />
        </div>
      </div>

      {/* Swaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSwaps.map(swap => {
          const cholSaved = swap.originalCholesterolMg - swap.swapCholesterolMg;
          const satFatSaved = Number((swap.originalSaturatedFatG - swap.swapSaturatedFatG).toFixed(1));
          const fiberGained = Number((swap.swapSolubleFiberG - swap.originalSolubleFiberG).toFixed(1));

          return (
            <div
              key={swap.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Before & After Title Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Traditional</span>
                    <h4 className="font-bold text-slate-800 text-sm">{swap.originalName}</h4>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

                  <div className="flex-1 text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3" /> Heart Smart
                    </span>
                    <h4 className="font-bold text-emerald-800 text-sm">{swap.swapName}</h4>
                  </div>
                </div>

                {/* Quantitative Metric Differentials */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center font-mono">
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-700 uppercase font-sans font-bold block">Cholesterol</span>
                    <span className="font-extrabold text-rose-800 text-xs">
                      {cholSaved > 0 ? `-${cholSaved} mg` : '0 mg'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-700 uppercase font-sans font-bold block">Sat Fat</span>
                    <span className="font-extrabold text-amber-800 text-xs">
                      {satFatSaved > 0 ? `-${satFatSaved} g` : '0 g'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 uppercase font-sans font-bold block">Sol Fiber</span>
                    <span className="font-extrabold text-emerald-800 text-xs">
                      {fiberGained > 0 ? `+${fiberGained} g` : '0 g'}
                    </span>
                  </div>
                </div>

                {/* Clinical Benefit Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {swap.benefitDescription}
                </p>
              </div>

              {/* Culinary & Preparation Tip */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Preparation Tip: </span>
                    <span>{swap.recipeOrTip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
