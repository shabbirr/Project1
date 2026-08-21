import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Download, 
  FileText, 
  Lock, 
  Radio, 
  UserCheck, 
  ChevronDown,
  Sparkles,
  RefreshCw,
  Activity
} from 'lucide-react';
import { UserSession, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserSession;
  onRoleChange: (role: UserRole) => void;
  onOpenTechDocs: () => void;
  onOpenSecurity: () => void;
  onOpenAuditLogs: () => void;
  onOpenMFA: () => void;
  onExportPDF: () => void;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  onOpenTechDocs,
  onOpenSecurity,
  onOpenAuditLogs,
  onOpenMFA,
  onExportPDF,
  isLiveStreaming,
  onToggleLiveStream,
  isExporting,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roles: { role: UserRole; title: string; desc: string; badge: string }[] = [
    { role: 'ADMIN', title: 'System Administrator', desc: 'Full access, key rotation, security & audit logs', badge: 'bg-rose-100 text-rose-800' },
    { role: 'LEAD_ANALYST', title: 'Lead Data Analyst', desc: 'Semantic queries, driver modeling, data exports', badge: 'bg-indigo-100 text-indigo-800' },
    { role: 'EXECUTIVE', title: 'Executive Stakeholder', desc: 'High-level KPI dashboards & PDF exports', badge: 'bg-emerald-100 text-emerald-800' },
    { role: 'VIEWER', title: 'Read-Only Viewer', desc: 'Restricted to dashboard viewing only', badge: 'bg-slate-100 text-slate-800' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  MetricMind
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Governed Semantic BI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Conversational BI • Cube.dev & PostgreSQL Layer
              </p>
            </div>
          </div>

          {/* Center Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            
            {/* Live Streaming Toggle */}
            <button
              id="live-stream-toggle-btn"
              onClick={onToggleLiveStream}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isLiveStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Toggle real-time streaming transactional data injection"
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
              <span>{isLiveStreaming ? 'Live Streaming: ON' : 'Live Stream: Off'}</span>
            </button>

            {/* Technical Docs Modal Button */}
            <button
              id="tech-docs-nav-btn"
              onClick={onOpenTechDocs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architecture & Docs</span>
            </button>

            {/* Security & Key Rotation Button */}
            <button
              id="security-nav-btn"
              onClick={onOpenSecurity}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256 / TLS 1.3</span>
            </button>

            {/* Audit Logs Button */}
            {currentUser.role === 'ADMIN' && (
              <button
                id="audit-logs-nav-btn"
                onClick={onOpenAuditLogs}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Logs</span>
              </button>
            )}
          </div>

          {/* Right Action Suite: PDF Export & User Role */}
          <div className="flex items-center space-x-3">
            
            {/* Export PDF Button */}
            {currentUser.role !== 'VIEWER' && (
              <button
                id="export-pdf-header-btn"
                onClick={onExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isExporting ? 'Generating PDF...' : 'Export PDF Report'}</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            {/* MFA Status Badge */}
            <button
              id="mfa-status-btn"
              onClick={onOpenMFA}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                currentUser.mfaVerified 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-600/40'
              }`}
              title="Multi-Factor Authentication Status"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden md:inline">{currentUser.mfaVerified ? 'MFA Verified' : 'MFA Required'}</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                id="role-switcher-dropdown-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-white leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-xs font-semibold text-slate-300">Simulate Enterprise User Role</p>
                    <p className="text-[11px] text-slate-400">Switches permission scopes in realtime</p>
                  </div>

                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        id={`select-role-${r.role.toLowerCase()}-btn`}
                        onClick={() => {
                          onRoleChange(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-700/60 flex items-start space-x-3 transition-colors ${
                          currentUser.role === r.role ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-200'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 ${currentUser.role === r.role ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold">{r.title}</span>
                            {currentUser.role === r.role && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono">ACTIVE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-2 px-3 flex flex-col space-y-1 sm:hidden">
                    <button
                      onClick={() => { onOpenTechDocs(); setRoleMenuOpen(false); }}
                      className="w-full text-left text-xs text-indigo-400 py-1"
                    >
                      • View Architecture & Technical Docs
                    </button>
                    <button
                      onClick={() => { onOpenSecurity(); setRoleMenuOpen(false); }}
                      className="w-full text-left text-xs text-emerald-400 py-1"
                    >
                      • AES-256 & Encryption Status
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
