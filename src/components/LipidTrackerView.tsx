import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LipidPanelEntry } from '../types';
import { classifyLipidPanel } from '../utils/cardiacCalculations';
import {
  Activity,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const LipidTrackerView: React.FC = () => {
  const { lipidPanels, addLipidPanel, deleteLipidPanel } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalChol, setTotalChol] = useState<number>(190);
  const [ldlVal, setLdlVal] = useState<number>(110);
  const [hdlVal, setHdlVal] = useState<number>(50);
  const [trigVal, setTrigVal] = useState<number>(140);
  const [testNotes, setTestNotes] = useState('');

  const sortedPanels = [...lipidPanels].sort(
    (a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime()
  );

  const latestPanel = sortedPanels[sortedPanels.length - 1];
  const previousPanel = sortedPanels.length > 1 ? sortedPanels[sortedPanels.length - 2] : null;

  const latestClassification = latestPanel
    ? classifyLipidPanel(latestPanel.totalCholesterol, latestPanel.ldl, latestPanel.hdl, latestPanel.triglycerides)
    : null;

  const handleSavePanel = (e: React.FormEvent) => {
    e.preventDefault();
    addLipidPanel({
      dateString: testDate,
      totalCholesterol: Number(totalChol),
      ldl: Number(ldlVal),
      hdl: Number(hdlVal),
      triglycerides: Number(trigVal),
      notes: testNotes || undefined,
    });
    setShowAddModal(false);
    setTestNotes('');
  };

  // SVG Chart Dimensions & Calculations
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const maxVal = Math.max(260, ...sortedPanels.map(p => Math.max(p.totalCholesterol, p.ldl, p.triglycerides)));
  const minVal = 30;

  const getY = (val: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    const ratio = (val - minVal) / (maxVal - minVal);
    return chartHeight - padding.bottom - ratio * usableHeight;
  };

  const getX = (index: number) => {
    if (sortedPanels.length <= 1) return padding.left + (chartWidth - padding.left - padding.right) / 2;
    const usableWidth = chartWidth - padding.left - padding.right;
    return padding.left + (index / (sortedPanels.length - 1)) * usableWidth;
  };

  const ldlPath = sortedPanels.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.ldl)}`).join(' ');
  const totalPath = sortedPanels.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.totalCholesterol)}`).join(' ');
  const hdlPath = sortedPanels.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.hdl)}`).join(' ');
  const trigPath = sortedPanels.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.triglycerides)}`).join(' ');

  // Classification styling
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'ideal':
      case 'normal':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'near-optimal':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'borderline':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Clinical Blood Lipid Profile</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track lab test results against American Heart Association (AHA) and NCEP ATP III guidelines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Lab Test</span>
        </button>
      </div>

      {/* Latest Test Result Summary */}
      {latestPanel && latestClassification && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Latest Blood Test Panel
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {new Date(latestPanel.dateString + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {latestPanel.notes && (
                <p className="text-xs text-slate-600 mt-1 italic">"{latestPanel.notes}"</p>
              )}
            </div>

            {previousPanel && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                {latestPanel.ldl < previousPanel.ldl ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>LDL down <strong>{previousPanel.ldl - latestPanel.ldl} mg/dL</strong> since last test</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                    <span>LDL up <strong>{latestPanel.ldl - previousPanel.ldl} mg/dL</strong></span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4 Core Clinical Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {/* LDL */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">LDL-C ("Bad")</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getBadgeStyle(latestClassification.ldl)}`}>
                  {latestClassification.ldl}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-mono text-3xl font-extrabold text-slate-900">{latestPanel.ldl}</span>
                <span className="text-xs text-slate-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Target: &lt;100 mg/dL (AHA optimal)
              </div>
            </div>

            {/* Total Cholesterol */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Total Cholesterol</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getBadgeStyle(latestClassification.total)}`}>
                  {latestClassification.total}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-mono text-3xl font-extrabold text-slate-900">{latestPanel.totalCholesterol}</span>
                <span className="text-xs text-slate-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Target: &lt;200 mg/dL (Desirable)
              </div>
            </div>

            {/* HDL */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">HDL-C ("Good")</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getBadgeStyle(latestClassification.hdl)}`}>
                  {latestClassification.hdl}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-mono text-3xl font-extrabold text-slate-900">{latestPanel.hdl}</span>
                <span className="text-xs text-slate-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Target: &gt;50 mg/dL (Cardioprotective)
              </div>
            </div>

            {/* Triglycerides */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Triglycerides</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getBadgeStyle(latestClassification.triglycerides)}`}>
                  {latestClassification.triglycerides}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-mono text-3xl font-extrabold text-slate-900">{latestPanel.triglycerides}</span>
                <span className="text-xs text-slate-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Target: &lt;150 mg/dL (Normal)
              </div>
            </div>
          </div>

          {/* Secondary Ratios */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <div>
              <span className="text-slate-400">Non-HDL Cholesterol: </span>
              <strong className="font-mono text-slate-900">{latestClassification.nonHdl} mg/dL</strong>
              <span className="text-slate-400 ml-1">(Target &lt;130)</span>
            </div>
            <div>
              <span className="text-slate-400">Total / HDL Ratio: </span>
              <strong className="font-mono text-slate-900">{latestClassification.totalToHdlRatio}</strong>
              <span className={`ml-1 text-[11px] font-semibold ${latestClassification.ratioStatus === 'ideal' ? 'text-emerald-700' : 'text-slate-700'}`}>
                ({latestClassification.ratioStatus})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Line Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Lipid Trajectory Over Time</h3>
            <p className="text-xs text-slate-500">Comparing LDL, Total Cholesterol, HDL, and Triglycerides</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
              <span>LDL-C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800 inline-block" />
              <span>Total Chol</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>HDL-C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Triglycerides</span>
            </div>
          </div>
        </div>

        {sortedPanels.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            No blood tests recorded yet. Click "Record New Lab Test" to start tracking.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              {/* Background Grid Lines & Y-axis labels */}
              {[50, 100, 150, 200, 250].map(val => (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={getY(val)}
                    x2={chartWidth - padding.right}
                    y2={getY(val)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray={val === 100 ? '4 4' : 'none'}
                  />
                  <text
                    x={padding.left - 8}
                    y={getY(val) + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                  {val === 100 && (
                    <text
                      x={chartWidth - padding.right}
                      y={getY(val) - 4}
                      textAnchor="end"
                      className="text-[9px] fill-emerald-600 font-bold"
                    >
                      LDL 100 Target
                    </text>
                  )}
                </g>
              ))}

              {/* Data Lines */}
              <path d={totalPath} fill="none" stroke="#1e293b" strokeWidth="2.5" />
              <path d={ldlPath} fill="none" stroke="#e11d48" strokeWidth="3" />
              <path d={trigPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
              <path d={hdlPath} fill="none" stroke="#059669" strokeWidth="2.5" />

              {/* Data Dots & X-Labels */}
              {sortedPanels.map((p, i) => {
                const x = getX(i);
                return (
                  <g key={p.id}>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={chartHeight - padding.bottom}
                      stroke="#f8fafc"
                      strokeWidth="1"
                    />

                    {/* Total Chol Dot */}
                    <circle cx={x} cy={getY(p.totalCholesterol)} r="4" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                    {/* LDL Dot */}
                    <circle cx={x} cy={getY(p.ldl)} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    {/* HDL Dot */}
                    <circle cx={x} cy={getY(p.hdl)} r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                    {/* Trig Dot */}
                    <circle cx={x} cy={getY(p.triglycerides)} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                    {/* Date label */}
                    <text
                      x={x}
                      y={chartHeight - padding.bottom + 18}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-mono font-medium"
                    >
                      {new Date(p.dateString + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Laboratory Test History</h3>
          <span className="text-xs text-slate-500">{sortedPanels.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">LDL-C</th>
                <th className="px-4 py-3">Total Chol</th>
                <th className="px-4 py-3">HDL-C</th>
                <th className="px-4 py-3">Triglycerides</th>
                <th className="px-4 py-3">Total/HDL</th>
                <th className="px-4 py-3">Clinical Notes</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedPanels.map(panel => {
                const c = classifyLipidPanel(panel.totalCholesterol, panel.ldl, panel.hdl, panel.triglycerides);
                return (
                  <tr key={panel.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">
                      {new Date(panel.dateString + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded ${panel.ldl >= 130 ? 'bg-rose-50 text-rose-800 font-bold' : 'text-slate-900'}`}>
                        {panel.ldl} mg/dL
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{panel.totalCholesterol} mg/dL</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">{panel.hdl} mg/dL</td>
                    <td className="px-4 py-3 text-slate-800">{panel.triglycerides} mg/dL</td>
                    <td className="px-4 py-3 text-slate-800">{c.totalToHdlRatio}</td>
                    <td className="px-4 py-3 font-sans text-slate-600 max-w-xs truncate">
                      {panel.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteLipidPanel(panel.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Lab Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Record Blood Lipid Panel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter lab values from your standard lipid panel test.
            </p>

            <form onSubmit={handleSavePanel} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block">Date of Blood Draw</label>
                <input
                  type="date"
                  required
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block">LDL-C (mg/dL)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="600"
                    value={ldlVal}
                    onChange={e => setLdlVal(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Target: &lt;100</span>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block">Total Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="700"
                    value={totalChol}
                    onChange={e => setTotalChol(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Target: &lt;200</span>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block">HDL-C (mg/dL)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="150"
                    value={hdlVal}
                    onChange={e => setHdlVal(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Target: &gt;50</span>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block">Triglycerides (mg/dL)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="2000"
                    value={trigVal}
                    onChange={e => setTrigVal(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Target: &lt;150</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block">Doctor / Cardiologist Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={testNotes}
                  onChange={e => setTestNotes(e.target.value)}
                  placeholder="e.g., Fasting test; physician recommended diet modification before statins"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Lab Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
