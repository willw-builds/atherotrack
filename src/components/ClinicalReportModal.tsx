import React from 'react';
import { useApp } from '../context/AppContext';
import { TARGET_PRESETS, classifyLipidPanel } from '../utils/cardiacCalculations';
import {
  X,
  Printer,
  Download,
  Heart,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({ isOpen, onClose }) => {
  const { meals, lipidPanels, targets, exportCsvData } = useApp();

  if (!isOpen) return null;

  // Group meals by date to calculate 7-day averages
  const mealsByDate: Record<string, typeof meals> = {};
  meals.forEach(m => {
    if (!mealsByDate[m.dateString]) mealsByDate[m.dateString] = [];
    mealsByDate[m.dateString].push(m);
  });

  const dates = Object.keys(mealsByDate).sort().reverse().slice(0, 7);
  const daysCount = Math.max(1, dates.length);

  let totalCholSum = 0;
  let totalSatFatSum = 0;
  let totalSolFiberSum = 0;
  let totalCalSum = 0;

  dates.forEach(d => {
    const dayMeals = mealsByDate[d] || [];
    dayMeals.forEach(m => {
      totalCholSum += m.cholesterolMg || 0;
      totalSatFatSum += m.saturatedFatG || 0;
      totalSolFiberSum += m.solubleFiberG || 0;
      totalCalSum += m.calories || 0;
    });
  });

  const avgChol = Math.round(totalCholSum / daysCount);
  const avgSatFat = Number((totalSatFatSum / daysCount).toFixed(1));
  const avgSolFiber = Number((totalSolFiberSum / daysCount).toFixed(1));
  const avgCal = Math.round(totalCalSum / daysCount);

  // Top cholesterol contributors
  const foodTotals: Record<string, { name: string; chol: number; satFat: number; count: number }> = {};
  meals.forEach(m => {
    if (!foodTotals[m.foodName]) {
      foodTotals[m.foodName] = { name: m.foodName, chol: 0, satFat: 0, count: 0 };
    }
    foodTotals[m.foodName].chol += m.cholesterolMg;
    foodTotals[m.foodName].satFat += m.saturatedFatG;
    foodTotals[m.foodName].count += 1;
  });

  const topCholFoods = Object.values(foodTotals)
    .sort((a, b) => b.chol - a.chol)
    .slice(0, 5);

  const topSatFatFoods = Object.values(foodTotals)
    .sort((a, b) => b.satFat - a.satFat)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const presetInfo = TARGET_PRESETS[targets.preset] || TARGET_PRESETS.aha_high_risk;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Physician & Cardiology Clinical Summary
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsvData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body (Styled for both Screen and Print) */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-slate-900 print:p-4">
          {/* Clinical Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">AtheroTrack</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                  Clinical Nutrition Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evidence-Based Cardiovascular Lipid Adherence & Nutritional Report
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
              <div><strong>Report Generated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div><strong>Target Protocol:</strong> {presetInfo.title}</div>
              <div><strong>Audit Period:</strong> Past {daysCount} recorded days ({dates[dates.length - 1] || 'Today'} to {dates[0] || 'Today'})</div>
            </div>
          </div>

          {/* Compliance Scorecards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Recent Daily Nutritional Adherence Averages
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-sans font-medium text-slate-500">Dietary Cholesterol</div>
                <div className="text-2xl font-bold mt-1 text-slate-900">
                  {avgChol} <span className="text-xs font-normal text-slate-500">mg/day</span>
                </div>
                <div className="text-[11px] mt-1 font-sans">
                  Target: &lt;{targets.maxCholesterolMg} mg (
                  <span className={avgChol <= targets.maxCholesterolMg ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {avgChol <= targets.maxCholesterolMg ? 'Compliant' : 'Above Target'}
                  </span>)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-sans font-medium text-slate-500">Saturated Fat</div>
                <div className="text-2xl font-bold mt-1 text-slate-900">
                  {avgSatFat} <span className="text-xs font-normal text-slate-500">g/day</span>
                </div>
                <div className="text-[11px] mt-1 font-sans">
                  Target: &lt;{targets.maxSaturatedFatG} g (
                  <span className={avgSatFat <= targets.maxSaturatedFatG ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {avgSatFat <= targets.maxSaturatedFatG ? 'Compliant' : 'Above Target'}
                  </span>)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-sans font-medium text-slate-500">Soluble Fiber</div>
                <div className="text-2xl font-bold mt-1 text-emerald-700">
                  {avgSolFiber} <span className="text-xs font-normal text-slate-500">g/day</span>
                </div>
                <div className="text-[11px] mt-1 font-sans">
                  Target: &gt;{targets.minSolubleFiberG} g (
                  <span className={avgSolFiber >= targets.minSolubleFiberG ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {avgSolFiber >= targets.minSolubleFiberG ? 'Target Met' : 'Needs Increase'}
                  </span>)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-sans font-medium text-slate-500">Average Energy</div>
                <div className="text-2xl font-bold mt-1 text-slate-900">
                  {avgCal} <span className="text-xs font-normal text-slate-500">kcal</span>
                </div>
                <div className="text-[11px] mt-1 font-sans text-slate-500">
                  Target: ~{targets.targetCalories} kcal
                </div>
              </div>
            </div>
          </div>

          {/* Top Nutritional Contributors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Top Dietary Cholesterol Contributors
              </h4>
              <ul className="text-xs divide-y divide-slate-100">
                {topCholFoods.map((f, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{f.name}</span>
                    <span className="font-mono font-bold text-rose-700">{f.chol} mg total</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Top Saturated Fat Contributors
              </h4>
              <ul className="text-xs divide-y divide-slate-100">
                {topSatFatFoods.map((f, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{f.name}</span>
                    <span className="font-mono font-bold text-amber-700">{f.satFat.toFixed(1)} g total</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Blood Lipid History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Laboratory Blood Lipid Panel Record
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-slate-100 text-slate-600 uppercase font-sans font-semibold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">LDL-C</th>
                  <th className="p-2.5">Total Chol</th>
                  <th className="p-2.5">HDL-C</th>
                  <th className="p-2.5">Triglycerides</th>
                  <th className="p-2.5">Non-HDL</th>
                  <th className="p-2.5">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lipidPanels.map(p => {
                  const c = classifyLipidPanel(p.totalCholesterol, p.ldl, p.hdl, p.triglycerides);
                  return (
                    <tr key={p.id}>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">{p.dateString}</td>
                      <td className="p-2.5 font-bold text-rose-700">{p.ldl} mg/dL</td>
                      <td className="p-2.5 text-slate-800">{p.totalCholesterol} mg/dL</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{p.hdl} mg/dL</td>
                      <td className="p-2.5 text-slate-800">{p.triglycerides} mg/dL</td>
                      <td className="p-2.5 text-slate-800">{c.nonHdl} mg/dL</td>
                      <td className="p-2.5 text-slate-800">{c.totalToHdlRatio}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clinical Sign-off & Notes footer */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between gap-6 text-xs text-slate-500">
            <div>
              <p className="max-w-md leading-relaxed">
                <strong>Clinical Notes:</strong> Dietary modifications focusing on replacing saturated fatty acids with monounsaturated/polyunsaturated fats and achieving &gt;10g daily soluble viscous fiber produce significant reductions in atherogenic apoB and LDL-C.
              </p>
            </div>
            <div className="w-48 border-t border-slate-400 pt-2 mt-4 sm:mt-0 text-center font-sans">
              <span className="block text-[11px] text-slate-400">Reviewing Clinician / Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
