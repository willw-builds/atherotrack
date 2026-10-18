import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TargetPreset, NutritionTargets } from '../types';
import { TARGET_PRESETS } from '../utils/cardiacCalculations';
import {
  X,
  Settings,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    targets,
    setTargets,
    resetToSampleData,
    exportDataJson,
    importDataJson,
    exportCsvData,
  } = useApp();

  const [currentPreset, setCurrentPreset] = useState<TargetPreset>(targets.preset);
  const [maxChol, setMaxChol] = useState<number>(targets.maxCholesterolMg);
  const [maxSatFat, setMaxSatFat] = useState<number>(targets.maxSaturatedFatG);
  const [minSolFiber, setMinSolFiber] = useState<number>(targets.minSolubleFiberG);
  const [minTotalFiber, setMinTotalFiber] = useState<number>(targets.minTotalFiberG);
  const [maxSodium, setMaxSodium] = useState<number>(targets.maxSodiumMg);
  const [targetCals, setTargetCals] = useState<number>(targets.targetCalories);

  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: TargetPreset) => {
    setCurrentPreset(presetKey);
    const presetData = TARGET_PRESETS[presetKey].targets;
    setMaxChol(presetData.maxCholesterolMg);
    setMaxSatFat(presetData.maxSaturatedFatG);
    setMinSolFiber(presetData.minSolubleFiberG);
    setMinTotalFiber(presetData.minTotalFiberG);
    setMaxSodium(presetData.maxSodiumMg);
    setTargetCals(presetData.targetCalories);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setTargets({
      preset: currentPreset,
      maxCholesterolMg: Number(maxChol),
      maxSaturatedFatG: Number(maxSatFat),
      maxTransFatG: 0,
      minSolubleFiberG: Number(minSolFiber),
      minTotalFiberG: Number(minTotalFiber),
      maxSodiumMg: Number(maxSodium),
      targetCalories: Number(targetCals),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          setImportStatus('Backup data imported successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Failed to parse JSON backup.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Targets, Guidelines & Data Management
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Target Presets Selection */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Clinical Guideline Presets
            </h3>
            <p className="text-slate-500">
              Choose an evidence-based clinical recommendation or customize targets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TARGET_PRESETS) as TargetPreset[]).map(key => {
                const preset = TARGET_PRESETS[key];
                const isSelected = currentPreset === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{preset.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {preset.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to tweak numerical limits */}
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Daily Nutrition Targets</h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-slate-700 block">Max Dietary Cholesterol</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={maxChol}
                    onChange={e => {
                      setMaxChol(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">mg</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Max Saturated Fat</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={maxSatFat}
                    onChange={e => {
                      setMaxSatFat(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">g</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Min Soluble Fiber</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={minSolFiber}
                    onChange={e => {
                      setMinSolFiber(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">g</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Min Total Fiber</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="15"
                    max="100"
                    value={minTotalFiber}
                    onChange={e => {
                      setMinTotalFiber(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">g</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Max Sodium Limit</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    value={maxSodium}
                    onChange={e => {
                      setMaxSodium(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">mg</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Target Energy</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="1000"
                    max="5000"
                    value={targetCals}
                    onChange={e => {
                      setTargetCals(Number(e.target.value));
                      setCurrentPreset('custom');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Apply Nutrition Targets
              </button>
            </div>
          </form>

          {/* Backup & Portability Section (OpenNutriTracker style) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">
              Data Privacy & Portability (Local Storage)
            </h4>
            <p className="text-slate-500">
              Your nutrition and blood lipid logs are stored securely in your browser's private local storage. You can backup, transfer, or restore your records at any time.
            </p>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportDataJson}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={exportCsvData}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV Log</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset to clinical sample demonstration data? Your custom changes will be replaced.')) {
                    resetToSampleData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg font-semibold hover:bg-rose-100 transition-colors ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
