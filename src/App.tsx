import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { AgentChat } from './components/AgentChat';
import { TrendCharts } from './components/TrendCharts';
import { DriverAnalysisModal } from './components/DriverAnalysisModal';
import { DataTableModal } from './components/DataTableModal';
import { QueryViewerModal } from './components/QueryViewerModal';
import { SecurityModal } from './components/SecurityModal';
import { AuditLogModal } from './components/AuditLogModal';
import { TechDocModal } from './components/TechDocModal';
import { MFAModal } from './components/MFAModal';
import { generateAnalyticsPDF } from './utils/pdfExport';
import { 
  FilterState, 
  MetricSummary, 
  ChartDataPoint, 
  UserSession, 
  UserRole, 
  CostDriver, 
  SemanticQueryPayload,
  SaleRecord
} from './types';
import { analyzeDrivers } from './services/semanticEngine';
import { 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Bot, 
  FileText, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function App() {
  // ----------------------------------------------------
  // User Session & Role
  // ----------------------------------------------------
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'USR-8821',
    name: 'Elena Rostova',
    email: 'elena.rostova@metricmind.corp',
    role: 'LEAD_ANALYST',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    mfaEnabled: true,
    mfaVerified: true,
  });

  // ----------------------------------------------------
  // Global Filters
  // ----------------------------------------------------
  const [filters, setFilters] = useState<FilterState>({
    quarter: 'ALL',
    year: 2026,
    region: 'ALL',
    category: 'ALL',
    searchQuery: '',
  });

  // ----------------------------------------------------
  // Data States
  // ----------------------------------------------------
  const [summary, setSummary] = useState<MetricSummary>({
    revenue: 0,
    previousRevenue: 0,
    revenueChangePercent: 0,
    cost: 0,
    previousCost: 0,
    costChangePercent: 0,
    profit: 0,
    previousProfit: 0,
    profitChangePercent: 0,
    marginPercent: 0,
    previousMarginPercent: 0,
    marginPointDelta: 0,
    totalVolume: 0,
    previousVolume: 0,
    volumeChangePercent: 0,
  });

  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(0);
  const [timeseriesData, setTimeseriesData] = useState<ChartDataPoint[]>([]);
  const [regionalData, setRegionalData] = useState<{ region: string; revenue: number; cost: number; profit: number; margin: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; revenue: number; cost: number; profit: number; margin: number }[]>([]);
  const [driversData, setDriversData] = useState<CostDriver[]>([]);
  
  // ----------------------------------------------------
  // Live Streaming & PDF State
  // ----------------------------------------------------
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ----------------------------------------------------
  // Modal Visibility States
  // ----------------------------------------------------
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isTechDocModalOpen, setIsTechDocModalOpen] = useState(false);
  const [isMFAModalOpen, setIsMFAModalOpen] = useState(false);

  const [selectedSemanticQuery, setSelectedSemanticQuery] = useState<SemanticQueryPayload | null>(null);
  const [selectedSqlQuery, setSelectedSqlQuery] = useState<string>('');
  const [selectedSampleData, setSelectedSampleData] = useState<Partial<SaleRecord>[] | undefined>(undefined);
  const [selectedDriverRegion, setSelectedDriverRegion] = useState<string>('Europe');

  // ----------------------------------------------------
  // Data Fetching
  // ----------------------------------------------------
  const fetchOverview = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        quarter: filters.quarter,
        year: String(filters.year),
        region: filters.region,
        category: filters.category,
        searchQuery: filters.searchQuery,
      });

      const res = await fetch(`/api/metrics/overview?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch metrics overview');
      const data = await res.json();
      setSummary(data.summary);
      setTotalRecordsCount(data.counts.totalTransactions);
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
  }, [filters]);

  const fetchTimeseries = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        region: filters.region,
        category: filters.category,
      });

      const res = await fetch(`/api/metrics/timeseries?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch timeseries');
      const data = await res.json();
      setTimeseriesData(data.timeseries);
      setRegionalData(data.regionalBreakdown);
      setCategoryData(data.categoryBreakdown);
    } catch (err) {
      console.error('Error fetching timeseries:', err);
    }
  }, [filters.region, filters.category]);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics/drivers?region=Europe&period1=Q2&period2=Q3');
      if (!res.ok) throw new Error('Failed to fetch drivers');
      const data = await res.json();
      setDriversData(data.drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchTimeseries();
    fetchDrivers();
  }, [fetchOverview, fetchTimeseries, fetchDrivers]);

  // Real-time live streaming interval simulator
  useEffect(() => {
    let interval: any;
    if (isLiveStreaming) {
      interval = setInterval(async () => {
        try {
          await fetch('/api/live/stream-record', { method: 'POST' });
          fetchOverview();
          fetchTimeseries();
        } catch (err) {
          console.error('Live stream injection error:', err);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLiveStreaming, fetchOverview, fetchTimeseries]);

  // ----------------------------------------------------
  // Handler Actions
  // ----------------------------------------------------
  const handleRoleChange = (newRole: UserRole) => {
    const roleProfiles: Record<UserRole, { name: string; email: string }> = {
      ADMIN: { name: 'Marcus Vance', email: 'marcus.vance@metricmind.corp' },
      LEAD_ANALYST: { name: 'Elena Rostova', email: 'elena.rostova@metricmind.corp' },
      EXECUTIVE: { name: 'Sarah Chen (VP Ops)', email: 'sarah.chen@metricmind.corp' },
      VIEWER: { name: 'Guest Stakeholder', email: 'guest@metricmind.corp' },
    };

    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      name: roleProfiles[newRole].name,
      email: roleProfiles[newRole].email,
      mfaVerified: newRole === 'ADMIN' ? true : prev.mfaVerified,
    }));
  };

  const handleOpenQueryModal = (query: SemanticQueryPayload, sql: string) => {
    setSelectedSemanticQuery(query);
    setSelectedSqlQuery(sql);
    setIsQueryModalOpen(true);
  };

  const handleOpenDataModal = (data?: Partial<SaleRecord>[]) => {
    setSelectedSampleData(data);
    setIsDataModalOpen(true);
  };

  const handleOpenDriverModal = (drivers?: CostDriver[], region = 'Europe') => {
    if (drivers && drivers.length > 0) {
      setDriversData(drivers);
    }
    setSelectedDriverRegion(region);
    setIsDriverModalOpen(true);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      generateAnalyticsPDF(summary, filters, driversData, currentUser, regionalData);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenTechDocs={() => setIsTechDocModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        onOpenMFA={() => setIsMFAModalOpen(true)}
        onExportPDF={handleExportPDF}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming(!isLiveStreaming)}
        isExporting={isExporting}
      />

      {/* Global Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onResetFilters={() => setFilters({ quarter: 'ALL', year: 2026, region: 'ALL', category: 'ALL', searchQuery: '' })}
        totalRecordsCount={totalRecordsCount}
      />

      {/* Main Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        
        {/* Governed KPI Metrics Deck */}
        <section aria-label="Governed Metrics">
          <KPICards
            summary={summary}
            onDrillDown={(metricKey) => {
              if (metricKey === 'kpi-margin') handleOpenDriverModal();
            }}
          />
        </section>

        {/* 2-Column Responsive Operational Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Conversational BI Agent (The Killer Feature) */}
          <section className="lg:col-span-6 w-full" aria-label="Conversational BI Agent">
            <AgentChat
              currentUser={currentUser}
              onOpenQueryModal={handleOpenQueryModal}
              onOpenDataModal={handleOpenDataModal}
              onOpenDriverModal={handleOpenDriverModal}
            />
          </section>

          {/* Right Column: Dynamic Interactive Charts */}
          <section className="lg:col-span-6 space-y-6 w-full" aria-label="Dynamic Analytics Visualizations">
            <TrendCharts
              timeseriesData={timeseriesData}
              regionalData={regionalData}
              categoryData={categoryData}
              onOpenDriverModal={() => handleOpenDriverModal()}
            />

            {/* Quick Governed Architecture Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Full 5-Phase Technical Documentation Available
                  </h4>
                  <p className="text-xs text-slate-300">
                    Inspect PostgreSQL schema, Cube.dev semantic layer, AI reasoning loop & AES-256 compliance.
                  </p>
                </div>
              </div>

              <button
                id="open-architecture-banner-btn"
                onClick={() => setIsTechDocModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-md shadow-indigo-600/30 transition-colors shrink-0"
              >
                View Documentation
              </button>
            </div>

          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">MetricMind</span>
            <span>•</span>
            <span>Agentic Conversational BI Platform</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">AES-256 / TLS 1.3 Certified</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setIsTechDocModalOpen(true)} className="hover:text-indigo-600">
              Technical Documentation
            </button>
            <button onClick={() => setIsSecurityModalOpen(true)} className="hover:text-indigo-600">
              Security Center
            </button>
            <button onClick={() => setIsAuditLogModalOpen(true)} className="hover:text-indigo-600">
              Audit Logs
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Suite */}
      <DriverAnalysisModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        drivers={driversData}
        region={selectedDriverRegion}
      />

      <DataTableModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        sampleData={selectedSampleData}
      />

      <QueryViewerModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        semanticQuery={selectedSemanticQuery}
        sqlQuery={selectedSqlQuery}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentUser={currentUser}
      />

      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
      />

      <TechDocModal
        isOpen={isTechDocModalOpen}
        onClose={() => setIsTechDocModalOpen(false)}
      />

      <MFAModal
        isOpen={isMFAModalOpen}
        onClose={() => setIsMFAModalOpen(false)}
        currentUser={currentUser}
        onMFAStatusChange={(verified) => setCurrentUser((prev) => ({ ...prev, mfaVerified: verified }))}
      />

    </div>
  );
}
