import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  BarChart, 
  AreaChart, 
  Line, 
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  PieChart, 
  ArrowUpRight, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { ChartDataPoint } from '../types';

interface TrendChartsProps {
  timeseriesData: ChartDataPoint[];
  regionalData: { region: string; revenue: number; cost: number; profit: number; margin: number }[];
  categoryData: { category: string; revenue: number; cost: number; profit: number; margin: number }[];
  onOpenDriverModal: () => void;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  timeseriesData,
  regionalData,
  categoryData,
  onOpenDriverModal,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'costs' | 'regions' | 'categories'>('trends');

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 text-xs">
          <p className="font-bold text-indigo-300 border-b border-slate-700 pb-1 mb-1.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between space-x-4 py-0.5">
              <span className="flex items-center text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {item.name.includes('%') || item.name.includes('Margin')
                  ? `${item.value}%`
                  : `$${Number(item.value).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Chart Navigation Tabs */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
            Interactive Business Intelligence Visualizations
          </h3>
          <p className="text-xs text-slate-500">
            Real-time trends, margin variances & cost composition
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
          <button
            id="tab-trends-btn"
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'trends'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarterly Trajectory
          </button>
          <button
            id="tab-costs-btn"
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'costs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Breakdown
          </button>
          <button
            id="tab-regions-btn"
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'regions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regional Comparison
          </button>
          <button
            id="tab-categories-btn"
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Categories
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="p-6">
        
        {/* Tab 1: Quarterly Trajectory (Revenue & Margin %) */}
        {activeTab === 'trends' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Revenue, Operating Profit & Gross Margin %</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                  Q3 European Dip Visible
                </span>
              </div>
              <button
                onClick={onOpenDriverModal}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <span>Explain Margin Anomaly</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeseriesData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} domain={[0, 50]} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  
                  <ReferenceLine yAxisId="right" y={30} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target 30% Baseline', fill: '#94a3b8', fontSize: 10 }} />
                  
                  <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
                  <Bar yAxisId="left" dataKey="profit" name="Gross Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" name="Gross Margin %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Cost Composition (Material vs Shipping vs Labor) */}
        {activeTab === 'costs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-700">Cost Structure Evolution (Material, Shipping & Labor)</span>
                <p className="text-[11px] text-slate-500">Notice the Q3 shipping logistics spike</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                Shipping +42% Surge in Q3
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseriesData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  
                  <Area type="monotone" dataKey="materialCost" name="Material Cost" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                  <Area type="monotone" dataKey="shippingCost" name="Shipping Cost (Driver)" stackId="1" stroke="#f43f5e" fill="#fda4af" />
                  <Area type="monotone" dataKey="laborCost" name="Labor Overhead" stackId="1" stroke="#f59e0b" fill="#fde68a" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Regional Comparison */}
        {activeTab === 'regions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Global Geographic Revenue & Gross Margin %</span>
              <span className="text-[11px] text-slate-500 font-mono">5 Governed Operating Regions</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={regionalData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} domain={[0, 45]} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  
                  <Bar yAxisId="left" dataKey="revenue" name="Regional Revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" name="Gross Margin %" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Product Categories */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Product Category Revenue vs Gross Operating Profit</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Enterprise AI delivers highest margin</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10.5, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  
                  <Bar dataKey="revenue" name="Category Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
