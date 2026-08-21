import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Code2, 
  Table, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  RefreshCw,
  HelpCircle,
  BarChart2,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AgentResponse, UserSession, CostDriver, SemanticQueryPayload, SaleRecord } from '../types';

interface AgentChatProps {
  currentUser: UserSession;
  onOpenQueryModal: (query: SemanticQueryPayload, sql: string) => void;
  onOpenDataModal: (data?: Partial<SaleRecord>[]) => void;
  onOpenDriverModal: (drivers: CostDriver[], region?: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  currentUser,
  onOpenQueryModal,
  onOpenDataModal,
  onOpenDriverModal,
}) => {
  const [messages, setMessages] = useState<AgentResponse[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Why did our European margins drop in Q3?',
    'Compare European revenue between Q2 and Q3',
    'Which cost increased the most in Europe?',
    'Show profit distribution across product categories',
    'What was our North American margin in Q2 vs Q3?',
  ];

  // Load initial demo question automatically on mount
  useEffect(() => {
    handleExecuteQuery('Why did our European margins drop in Q3?');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    if (currentUser.role === 'VIEWER') {
      alert('Viewers have read-only permissions. Switch to Lead Analyst or Admin to run live conversational agent queries.');
      return;
    }

    setIsLoading(true);
    setInputQuery('');

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          userRole: currentUser.role,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) throw new Error('Agent query failed');
      const data: AgentResponse = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[740px]">
      
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/80 flex items-center justify-center border border-indigo-400/30">
            <Bot className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">MetricMind Conversational BI Agent</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Cube Semantic Layer
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Deterministic governed metrics • Multi-step cost & revenue root-cause investigation
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>No Raw SQL Hallucinations</span>
        </div>
      </div>

      {/* Suggested Questions Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1" />
          Try Asking:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            id={`agent-prompt-chip-${idx}`}
            onClick={() => handleExecuteQuery(p)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 font-medium whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            
            {/* User Question Bubble */}
            <div className="flex items-start justify-end space-x-2.5">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xl shadow-xs">
                <p className="text-xs sm:text-sm font-medium">{msg.question}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            </div>

            {/* Agent Answer Card */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-5 border border-slate-200 shadow-sm space-y-4">
                
                {/* Answer Narrative */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Semantic Analysis Result
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {msg.answer}
                  </p>
                </div>

                {/* Key Takeaway Highlight Box */}
                {msg.keyTakeaway && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start space-x-2.5">
                    <div className="p-1 bg-amber-100 rounded-md text-amber-700 shrink-0 mt-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900">Key Finding: </span>
                      <span className="text-xs text-amber-800">{msg.keyTakeaway}</span>
                    </div>
                  </div>
                )}

                {/* Cost Drivers Grid (If Available) */}
                {msg.drivers && msg.drivers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Investigated Cost Drivers (Q2 vs Q3)
                      </h4>
                      <button
                        onClick={() => onOpenDriverModal(msg.drivers!, msg.region)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <span>Deep Dive Waterfall</span>
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {msg.drivers.map((driver, dIdx) => (
                        <div
                          key={dIdx}
                          className={`p-2.5 rounded-xl border ${
                            driver.type === 'shipping'
                              ? 'bg-rose-50/70 border-rose-200'
                              : driver.type === 'material'
                              ? 'bg-amber-50/70 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{driver.name}</span>
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                driver.percentChange > 20
                                  ? 'bg-rose-100 text-rose-700'
                                  : driver.percentChange > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              +{driver.percentChange}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                            {driver.description}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>Contribution to drop:</span>
                            <strong className="text-slate-800">{driver.contributionToMarginDropPercent}%</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embedded Interactive Chart */}
                {msg.chart && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center">
                        <BarChart2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                        {msg.chart.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Recharts Engine</span>
                    </div>

                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {msg.chart.type === 'line' ? (
                          <LineChart data={msg.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey={msg.chart.xAxisKey} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            {msg.chart.series.map((s, sIdx) => (
                              <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.name}
                                stroke={s.color}
                                strokeWidth={2.5}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                              />
                            ))}
                          </LineChart>
                        ) : (
                          <BarChart data={msg.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey={msg.chart.xAxisKey} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            {msg.chart.series.map((s) => (
                              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
                            ))}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Transparency Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    id={`view-data-btn-${msg.id}`}
                    onClick={() => onOpenDataModal(msg.rawSampleData)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    <Table className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Underlying Data</span>
                  </button>

                  <button
                    id={`view-query-btn-${msg.id}`}
                    onClick={() => onOpenQueryModal(msg.semanticQuery, msg.sqlQuery)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Semantic API Query</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-500 text-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-xs flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Querying Cube.dev Semantic Layer & Evaluating Multi-Step Cost Drivers...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteQuery(inputQuery);
        }}
        className="p-3.5 bg-white border-t border-slate-200 flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <input
            id="agent-chat-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask MetricMind (e.g., 'Why did European margins drop in Q3?')..."
            disabled={isLoading || currentUser.role === 'VIEWER'}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <button
          id="agent-chat-send-btn"
          type="submit"
          disabled={!inputQuery.trim() || isLoading || currentUser.role === 'VIEWER'}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask Agent</span>
        </button>
      </form>

    </div>
  );
};
