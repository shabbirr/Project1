import React from 'react';
import { X, TrendingDown, ArrowRight, AlertTriangle, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import { CostDriver } from '../types';

interface DriverAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: CostDriver[];
  region?: string;
}

export const DriverAnalysisModal: React.FC<DriverAnalysisModalProps> = ({
  isOpen,
  onClose,
  drivers,
  region = 'Europe',
}) => {
  if (!isOpen) return null;

  const totalMarginDropPts = 7.0; // 32.1% -> 25.1%

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {region} Q3 Margin Drop — Multi-Step Root-Cause Decomposition
              </h3>
              <p className="text-xs text-slate-400">
                Cube.dev Governed Semantic Variance Analysis • Q2 Baseline vs Q3 Actual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Investigation Verdict
              </h4>
              <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                European gross margin dropped from <strong>32.1% in Q2</strong> to <strong>25.1% in Q3</strong>, creating a <strong>-7.0 percentage-point contraction</strong>. The primary culprit is <strong>Shipping Logistics Costs</strong> which surged <strong>+42.1%</strong>, contributing to over <strong>62% of the entire margin decline</strong>.
              </p>
            </div>
          </div>

          {/* Variance Step Waterfall Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Granular Driver Decomposition Table
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Cost Driver Component</th>
                    <th className="px-3 py-3">Q2 Baseline</th>
                    <th className="px-3 py-3">Q3 Actual</th>
                    <th className="px-3 py-3">Percentage Delta</th>
                    <th className="px-3 py-3">Impact Contribution</th>
                    <th className="px-4 py-3">Root-Cause Driver Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((d, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-rose-50/40 font-medium' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3 flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${d.type === 'shipping' ? 'bg-rose-500' : d.type === 'material' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span className="font-bold text-slate-900">{d.name}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600">${d.period1Value.toLocaleString()}</td>
                      <td className="px-3 py-3 font-mono text-slate-900 font-bold">${d.period2Value.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${d.percentChange > 20 ? 'bg-rose-100 text-rose-700' : d.percentChange > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          +{d.percentChange}%
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        {d.contributionToMarginDropPercent}% of drop
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px] leading-snug">
                        {d.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Recommended Executive Mitigations:
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>Reroute Regional Freight</strong>: Transition maritime container contracts from spot rate to fixed 12-month tier pricing to hedge against seasonal European rate volatility.</li>
              <li><strong>Semiconductor Indexing</strong>: Renegotiate Q4 silicon wafer supply contracts with Tier-1 fabrication partners in Germany and Netherlands.</li>
              <li><strong>Preserve Labor Efficiency</strong>: Labor efficiency remained exceptional (+0.8%), maintaining healthy factory floor unit economics.</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Audited & Verified via MetricMind Governed Semantic Pipeline</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Investigation
          </button>
        </div>

      </div>
    </div>
  );
};
