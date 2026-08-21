import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Database, 
  Layers, 
  Bot, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TechDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechDocModal: React.FC<TechDocModalProps> = ({ isOpen, onClose }) => {
  const [activePhase, setActivePhase] = useState<number>(1);

  if (!isOpen) return null;

  const phases = [
    {
      id: 1,
      title: 'Phase 1: Database & Data Schema',
      subtitle: 'PostgreSQL Relational Fact/Dimension Model',
      icon: Database,
      badge: 'Relational DB',
      content: {
        summary: 'Designed normalized relational schema with 6 core tables: sales, costs, products, customers, regions, dates. Seeded with 500+ records demonstrating European Q3 margin drop driven by shipping inflation.',
        codeTitle: 'PostgreSQL Normalized Tables Schema',
        code: `CREATE TABLE sales (
  id VARCHAR(64) PRIMARY KEY,
  date DATE NOT NULL,
  quarter VARCHAR(8) NOT NULL,
  year INT NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id),
  product_id VARCHAR(64) REFERENCES products(id),
  region VARCHAR(64) NOT NULL,
  country VARCHAR(128) NOT NULL,
  revenue NUMERIC(14, 2) NOT NULL,
  quantity INT NOT NULL
);

CREATE TABLE costs (
  id VARCHAR(64) PRIMARY KEY,
  sale_id VARCHAR(64) REFERENCES sales(id),
  material_cost NUMERIC(14, 2) NOT NULL,
  shipping_cost NUMERIC(14, 2) NOT NULL,
  labor_cost NUMERIC(14, 2) NOT NULL
);`,
        highlights: [
          'Calibrated European Q2 baseline margin at 32.1% and Q3 at 25.1% (-7.0% pts drop)',
          'Separated material, shipping, and labor costs to enable exact variance attribution',
          'Enforced foreign keys and relational integrity with indexed date/region lookups',
        ],
      },
    },
    {
      id: 2,
      title: 'Phase 2: dbt & Cube.dev Semantic Layer',
      subtitle: 'Governed Metrics & Zero-Hallucination SQL Contract',
      icon: Layers,
      badge: 'Semantic Layer',
      content: {
        summary: 'Defined governed business metric measures (Revenue, Cost, Profit, Margin, Margin %) and dimensions (Region, Country, Product, Category, Quarter, Month, Year) in Cube.dev YAML schema.',
        codeTitle: 'Cube.dev Governed Model (Sales.yml)',
        code: `cubes:
  - name: Sales
    measures:
      - name: revenue
        type: sum
        sql: revenue
      - name: totalCost
        type: sum
        sql: material_cost + shipping_cost + labor_cost
      - name: shippingCost
        type: sum
        sql: shipping_cost
      - name: profit
        type: number
        sql: "{revenue} - {totalCost}"
      - name: marginPercent
        type: number
        sql: "(({revenue} - {totalCost}) / NULLIF({revenue}, 0)) * 100"
    dimensions:
      - name: region
        sql: region
      - name: quarter
        sql: quarter`,
        highlights: [
          'Pre-standardized metric calculations prevent ambiguous or conflicting KPI definitions',
          'Blocks arbitrary SQL generation by LLM, strictly routing requests through Cube schema',
          'Provides instant SQL & JSON transparency for analyst auditability',
        ],
      },
    },
    {
      id: 3,
      title: 'Phase 3: AI Conversational Agent',
      subtitle: 'Gemini AI + Multi-Step Driver Reasoning Engine',
      icon: Bot,
      badge: 'AI BI Agent',
      content: {
        summary: 'Implemented server-side Gemini 3.7 Flash agent that resolves user queries, generates semantic queries, runs multi-step period comparisons, isolates primary cost drivers, and formats rich visual answers.',
        codeTitle: 'Multi-Step Driver Reasoning Loop',
        code: `// 1. Resolve User Intent & Dimensions (Region: Europe, Period: Q2 vs Q3)
// 2. Query Governed Semantic Layer for Q2 & Q3 Margins
// 3. Compute Delta (-7.0% pts drop)
// 4. Decompose Cost Drivers:
//    - Shipping Cost: +42.1% ($12.4k -> $17.6k) [Primary Contributor: 62%]
//    - Material Cost: +8.1% ($38.2k -> $41.3k) [Secondary Contributor: 31%]
//    - Labor Overhead: +0.8% ($19.1k -> $19.3k) [Stable]
// 5. Generate Natural Language Explanation & Structured Recharts Payload`,
        highlights: [
          'Automated root-cause analysis pinpoints exact operational bottlenecks',
          'Embeds dynamic charts, driver chips, and sample data directly inside chat answers',
          'Graceful offline fallback engine ensures 100% continuous uptime',
        ],
      },
    },
    {
      id: 4,
      title: 'Phase 4: UI/UX & Real-Time Analytics',
      subtitle: 'Responsive Dashboards, Recharts & Live Streams',
      icon: BarChart3,
      badge: 'Frontend & Charts',
      content: {
        summary: 'Built responsive single/multi-view layout with global filtering (Quarter, Region, Category, Search), dynamic Recharts suite, real-time live transactional stream toggling, and PDF export.',
        codeTitle: 'Dynamic Visualizations Suite',
        code: `// Visualizations Implemented:
// 1. Quarterly Trajectory (Composed Bar & Line Margin Trend)
// 2. Cost Breakdown Area Chart (Material vs Shipping vs Labor)
// 3. Regional Geographic Performance Bar Chart
// 4. Product Category Profitability Matrix
// 5. Live Stream Transactional Injection Pipeline`,
        highlights: [
          'Mobile & desktop fluid layout with high contrast typography and zero layout shift',
          'Interactive tooltips, reference target lines, and quick scenario filter presets',
          'One-click publication-ready PDF analytics report generation with jsPDF',
        ],
      },
    },
    {
      id: 5,
      title: 'Phase 5: Enterprise Security & RBAC',
      subtitle: 'AES-256 at Rest, TLS 1.3, MFA & 90-Day Key Rotation',
      icon: ShieldCheck,
      badge: 'Security & Audit',
      content: {
        summary: 'Enforced Role-Based Access Control (Admin, Lead Analyst, Executive, Viewer), Multi-Factor Authentication (MFA), immutable audit logging, AES-256 data at rest, and 90-day cryptographic key rotation.',
        codeTitle: 'Role Permissions Matrix & Key Lifecycle',
        code: `// Role Permissions:
// - ADMIN: Full access, key rotation, security & audit logs
// - LEAD_ANALYST: AI queries, driver models, CSV/PDF exports
// - EXECUTIVE: High-level KPI dashboards, PDF reports
// - VIEWER: Read-only dashboard view

// Cryptographic Standards:
// - Data at Rest: AES-256-GCM Block Cipher
// - Data in Transit: TLS 1.3 Strict Forward Secrecy
// - Key Rotation: Automated 90-day lifecycle countdown with on-demand trigger`,
        highlights: [
          'Full audit logging captures all queries, exports, and admin actions',
          'Simulated TOTP / MFA verification flow ensures privileged action security',
          'SOC2 Type II and ISO 27001 compliance standards enforced',
        ],
      },
    },
  ];

  const current = phases.find((p) => p.id === activePhase) || phases[0];
  const PhaseIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                MetricMind Comprehensive Technical Architecture
              </h3>
              <p className="text-xs text-slate-400">
                5-Phase Implementation Blueprint • Governed Conversational BI System
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

        {/* Phase Selector Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {phases.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activePhase === p.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>Phase {p.id}</span>
            </button>
          ))}
        </div>

        {/* Phase Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Phase Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                <PhaseIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Development Milestone {current.id}
                </span>
                <h4 className="text-base font-bold text-slate-900">{current.title}</h4>
                <p className="text-xs text-slate-500">{current.subtitle}</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {current.badge}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {current.content.summary}
          </p>

          {/* Key Deliverables */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Key Engineering Accomplishments:
            </h5>
            <ul className="space-y-1.5">
              {current.content.highlights.map((h, hIdx) => (
                <li key={hIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Spec Block */}
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 block">
              {current.content.codeTitle}
            </span>
            <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <pre className="text-indigo-300 leading-relaxed">
                <code>{current.content.code}</code>
              </pre>
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActivePhase((prev) => Math.max(1, prev - 1))}
              disabled={activePhase === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
            >
              Previous Phase
            </button>
            <button
              onClick={() => setActivePhase((prev) => Math.min(phases.length, prev + 1))}
              disabled={activePhase === phases.length}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold disabled:opacity-40"
            >
              Next Phase
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
