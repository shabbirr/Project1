import React, { useState } from 'react';
import { X, Code2, Copy, Check, ShieldCheck, Database, Layers } from 'lucide-react';
import { SemanticQueryPayload } from '../types';

interface QueryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  semanticQuery: SemanticQueryPayload | null;
  sqlQuery: string;
}

export const QueryViewerModal: React.FC<QueryViewerModalProps> = ({
  isOpen,
  onClose,
  semanticQuery,
  sqlQuery,
}) => {
  const [copied, setCopied] = useState<'cube' | 'sql' | null>(null);
  const [activeTab, setActiveTab] = useState<'cube' | 'sql'>('cube');

  if (!isOpen || !semanticQuery) return null;

  const cubeJsonString = JSON.stringify(
    {
      measures: semanticQuery.measures,
      dimensions: semanticQuery.dimensions || [],
      timeDimensions: semanticQuery.timeDimensions || [],
      filters: semanticQuery.filters || [],
    },
    null,
    2
  );

  const copyToClipboard = (text: string, type: 'cube' | 'sql') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Governed Semantic Layer & SQL Inspection
              </h3>
              <p className="text-xs text-slate-400">
                Cube.dev REST API Protocol • Transparent Query Contract
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

        {/* Tab switcher */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('cube')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cube'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cube.dev Semantic Query (JSON)</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sql'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Compiled PostgreSQL Query</span>
            </button>
          </div>

          <button
            onClick={() => copyToClipboard(activeTab === 'cube' ? cubeJsonString : sqlQuery, activeTab)}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-indigo-600 font-medium"
          >
            {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === activeTab ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 text-slate-100 overflow-x-auto font-mono text-xs max-h-96">
          {activeTab === 'cube' ? (
            <pre className="text-indigo-300 leading-relaxed">
              <code>{cubeJsonString}</code>
            </pre>
          ) : (
            <pre className="text-emerald-300 leading-relaxed">
              <code>{sqlQuery || semanticQuery.generatedSql}</code>
            </pre>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Guaranteed Zero SQL Injection • LLM cannot mutate SQL directly</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
