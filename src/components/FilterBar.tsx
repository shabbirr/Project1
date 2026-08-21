import React from 'react';
import { 
  Filter, 
  Calendar, 
  Globe, 
  Layers, 
  Search, 
  X, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { FilterState, RegionName, ProductCategory } from '../types';
import { REGIONS, CATEGORIES } from '../data/dataset';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalRecordsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalRecordsCount,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const quarters = [
    { value: 'ALL', label: 'All Quarters (FY2026)' },
    { value: 'Q1', label: 'Q1 2026' },
    { value: 'Q2', label: 'Q2 2026' },
    { value: 'Q3', label: 'Q3 2026 (Margin Drop)' },
    { value: 'Q4', label: 'Q4 2026' },
  ];

  const presets: { name: string; filters: Partial<FilterState>; icon?: string }[] = [
    {
      name: '🔍 European Q3 Margin Drop',
      filters: { region: 'Europe', quarter: 'Q3', category: 'ALL' },
    },
    {
      name: '🇺🇸 North America High Margin',
      filters: { region: 'North America', quarter: 'ALL', category: 'ALL' },
    },
    {
      name: '⚡ Enterprise AI Category',
      filters: { region: 'ALL', quarter: 'ALL', category: 'Enterprise AI' },
    },
    {
      name: '🌐 Global Q2 Baseline',
      filters: { region: 'ALL', quarter: 'Q2', category: 'ALL' },
    },
  ];

  const isFiltered = 
    filters.quarter !== 'ALL' || 
    filters.region !== 'ALL' || 
    filters.category !== 'ALL' || 
    filters.searchQuery !== '';

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Desktop Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left Controls: Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            <div className="flex items-center text-xs font-semibold text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              <span>Filters:</span>
            </div>

            {/* Date Range / Quarter Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <select
                id="filter-quarter-select"
                aria-label="Filter by Quarter or Date Range"
                value={filters.quarter}
                onChange={(e) => onFilterChange({ quarter: e.target.value })}
                className="pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
              >
                {quarters.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <select
                id="filter-region-select"
                aria-label="Filter by Geographic Region"
                value={filters.region}
                onChange={(e) => onFilterChange({ region: e.target.value })}
                className="pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
              >
                <option value="ALL">All Regions (Global)</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <select
                id="filter-category-select"
                aria-label="Filter by Product Category"
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
              >
                <option value="ALL">All Product Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                id="filter-search-input"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                placeholder="Search products, accounts..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                id="reset-filters-btn"
                onClick={onResetFilters}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right Status / Quick Presets */}
          <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              Matching Records: <strong className="text-slate-800">{totalRecordsCount}</strong>
            </span>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center overflow-x-auto no-scrollbar space-x-2">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center">
            <Sparkles className="w-3 h-3 text-indigo-500 mr-1" />
            Quick Scenarios:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => onFilterChange(p.filters)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 hover:border-indigo-200 transition-colors whitespace-nowrap"
            >
              {p.name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
