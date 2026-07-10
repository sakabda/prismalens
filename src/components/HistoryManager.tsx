import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryManagerProps {
  history: HistoryItem[];
  clearHistory: () => void;
  loadHistoryItem: (item: HistoryItem) => void;
}

export default function HistoryManager({
  history,
  clearHistory,
  loadHistoryItem,
}: HistoryManagerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fadeIn" id="history-workspace">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Clock className="text-teal-400" size={18} />
            Translation Sandbox History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Keep track of past queries converted in your active workspace session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-950 text-rose-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            id="btn-clear-history"
          >
            Clear All History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4" id="history-items-list">
          {history.map((item) => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.fromLanguage === 'prisma' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-900' 
                      : 'bg-teal-950 text-teal-300 border border-teal-900'
                  }`}>
                    {item.fromLanguage === 'prisma' ? 'Prisma → SQL' : 'SQL → Prisma'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{item.dialect}</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} />
                    {item.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Input Context:</div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800/60 rounded-lg text-[11px] font-mono text-slate-300 max-h-[80px] overflow-y-auto truncate whitespace-pre-wrap">
                      {item.input}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compiled Output:</div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800/60 rounded-lg text-[11px] font-mono text-teal-300 max-h-[80px] overflow-y-auto truncate whitespace-pre-wrap">
                      {item.output}
                    </pre>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadHistoryItem(item)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                Restore Workspace
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500" id="empty-history-placeholder">
          <Clock className="mx-auto mb-3 opacity-30" size={36} />
          <div className="text-sm font-bold">No saved queries yet</div>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
            Translate queries in the workspace editor tab to save and compare outcomes here.
          </p>
        </div>
      )}
    </div>
  );
}
