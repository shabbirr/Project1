import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  Percent, 
  Package, 
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { MetricSummary } from '../types';

interface KPICardsProps {
  summary: MetricSummary;
  onDrillDown: (metricKey: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, onDrillDown }) => {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  const cards = [
    {
      id: 'kpi-revenue',
      title: 'Governed Revenue',
      formula: 'SUM(sales.revenue)',
      value: `$${(summary.revenue).toLocaleString()}`,
      delta: summary.revenueChangePercent,
      isPercentDelta: true,
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Gross invoiced revenue across matching customer purchase orders.',
    },
    {
      id: 'kpi-cost',
      title: 'Total Operating Cost',
      formula: 'SUM(material_cost + shipping_cost + labor_cost)',
      value: `$${(summary.cost).toLocaleString()}`,
      delta: summary.costChangePercent,
      isPercentDelta: true,
      inverseDelta: true, // Higher cost is negative
      icon: CreditCard,
      color: 'from-amber-500 to-rose-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Granular sum of material acquisition, freight & shipping logistics, and direct labor overhead.',
    },
    {
      id: 'kpi-profit',
      title: 'Gross Operating Profit',
      formula: 'Revenue - Cost',
      value: `$${(summary.profit).toLocaleString()}`,
      delta: summary.profitChangePercent,
      isPercentDelta: true,
      icon: PieChart,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Net residual revenue after deducting full transactional cost allocations.',
    },
    {
      id: 'kpi-margin',
      title: 'Gross Margin %',
      formula: '((Revenue - Cost) / Revenue) * 100',
      value: `${summary.marginPercent}%`,
      delta: summary.marginPointDelta,
      isPointDelta: true,
      icon: Percent,
      color: summary.marginPercent < 28 ? 'from-rose-500 to-red-600' : 'from-indigo-500 to-purple-600',
      textColor: summary.marginPercent < 28 ? 'text-rose-600' : 'text-indigo-600',
      bgColor: summary.marginPercent < 28 ? 'bg-rose-50' : 'bg-indigo-50',
      description: 'Core profitability efficiency benchmark governed by Cube.dev semantic model.',
      alert: summary.marginPercent < 28 ? 'Margin Alert: Below target 30% baseline' : undefined,
    },
    {
      id: 'kpi-volume',
      title: 'Units Shipped',
      formula: 'SUM(sales.quantity)',
      value: summary.totalVolume.toLocaleString(),
      delta: summary.volumeChangePercent,
      isPercentDelta: true,
      icon: Package,
      color: 'from-slate-600 to-slate-800',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
      description: 'Aggregate quantity of enterprise hardware blades & licensed software units dispatched.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.inverseDelta ? card.delta < 0 : card.delta >= 0;
        const DeltaIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={card.id}
            id={card.id}
            className="relative bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            {/* Top Bar: Title & Tooltip Trigger */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide">
                  {card.title}
                </span>
                
                <div className="relative">
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === card.id ? null : card.id)}
                    onMouseEnter={() => setActiveTooltip(card.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Governed metric definition"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Tooltip Card */}
                  {activeTooltip === card.id && (
                    <div className="absolute right-0 top-6 w-56 p-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] z-30 pointer-events-none">
                      <p className="font-semibold text-indigo-300 mb-1">Cube.dev Semantic Formula:</p>
                      <code className="block bg-slate-800 p-1.5 rounded font-mono text-[10px] text-emerald-400 mb-1.5">
                        {card.formula}
                      </code>
                      <p className="text-slate-300 leading-snug">{card.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </div>
            </div>

            {/* Bottom Bar: Period Delta & Status */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <DeltaIcon className="w-3 h-3 mr-0.5" />
                  {card.isPointDelta 
                    ? `${card.delta >= 0 ? '+' : ''}${card.delta}% pts`
                    : `${card.delta >= 0 ? '+' : ''}${card.delta}%`}
                </span>
                <span className="text-[10px] text-slate-400">vs prior period</span>
              </div>

              {card.alert && (
                <span className="flex items-center text-rose-600" title={card.alert}>
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
