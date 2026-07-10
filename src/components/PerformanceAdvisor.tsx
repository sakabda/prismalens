import React from 'react';
import { Cpu, AlertTriangle, CheckCircle2, TrendingUp, Copy, Check } from 'lucide-react';
import { ConversionResponse } from '../types';

interface PerformanceAdvisorProps {
  conversionResult: ConversionResponse;
  copiedIndexSql: number | null;
  copyIndexSql: (text: string, idx: number) => void;
}

export default function PerformanceAdvisor({
  conversionResult,
  copiedIndexSql,
  copyIndexSql,
}: PerformanceAdvisorProps) {
  const analysis = conversionResult.analysis;

  if (!analysis) {
    return null;
  }

  return (
    <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between" id="panel-perf-advisor">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Performance & Index Advisor
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Score:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              analysis.performanceScore >= 80 
                ? 'bg-emerald-950 text-emerald-300' 
                : analysis.performanceScore >= 50 
                ? 'bg-amber-950 text-amber-300' 
                : 'bg-rose-950 text-rose-300'
            }`}>
              {analysis.performanceScore}/100
            </span>
          </div>
        </div>

        {/* Warnings Block */}
        <div className="space-y-2 mb-4" id="warnings-block">
          {analysis.warnings && analysis.warnings.length > 0 ? (
            analysis.warnings.map((w, idx) => (
              <div key={idx} className="flex gap-2 p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs text-rose-300 leading-relaxed">
                <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))
          ) : (
            <div className="flex gap-2 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>This query follows standard indexing paths. Projections and filters are optimized for database engines.</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Index recommendations */}
      <div id="index-recommendations-block">
        <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1">
          <TrendingUp size={13} className="text-teal-400" />
          SQL Index Suggestions
        </div>
        
        {analysis.indexSuggestions && analysis.indexSuggestions.length > 0 ? (
          <div className="space-y-2 max-h-[170px] overflow-y-auto">
            {analysis.indexSuggestions.map((index, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold font-mono">
                    Table: "{index.table}" ({index.columns.join(', ')})
                  </span>
                  <button
                    onClick={() => copyIndexSql(index.sql, idx)}
                    className="text-[10px] text-teal-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedIndexSql === idx ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    Copy SQL
                  </button>
                </div>
                <p className="text-slate-400 leading-tight">
                  {index.reason}
                </p>
                <code className="text-teal-300 text-[10px] bg-slate-900 px-1.5 py-1 rounded font-mono truncate">
                  {index.sql}
                </code>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
            All potential join linkages are standard or rely on primary index columns. No secondary indexing needed.
          </div>
        )}
      </div>

    </div>
  );
}
