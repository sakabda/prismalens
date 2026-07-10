import React from 'react';
import { ArrowLeftRight, Database, Clock, Code2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'convert' | 'schema' | 'history';
  setActiveTab: (tab: 'convert' | 'schema' | 'history') => void;
  historyCount: number;
}

export default function Header({ activeTab, setActiveTab, historyCount }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/85 backdrop-blur px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40" id="header-section">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl text-slate-950 shadow-lg shadow-teal-500/10">
          <ArrowLeftRight size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent flex items-center gap-2">
            Prisma & SQL Query Translator
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Deterministic AST compiler mapping nested Prisma include joins to relational SQL projections & schemas
          </p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800" id="navigation-tabs">
        <button
          onClick={() => setActiveTab('convert')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'convert' 
              ? 'bg-slate-800 text-teal-400 shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="tab-convert"
        >
          <Code2 size={14} />
          Query Translator
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'schema' 
              ? 'bg-slate-800 text-teal-400 shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="tab-schema"
        >
          <Database size={14} />
          Schema Mappings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-slate-800 text-teal-400 shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="tab-history"
        >
          <Clock size={14} />
          History ({historyCount})
        </button>
      </div>
    </header>
  );
}
