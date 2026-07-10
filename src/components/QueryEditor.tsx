import React from 'react';
import { Check, Copy, Play, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { QueryLanguage, ConversionResponse } from '../types';

interface QueryEditorProps {
  fromLanguage: QueryLanguage;
  autoDetect: boolean;
  inputCode: string;
  setInputCode: (code: string) => void;
  copiedInput: boolean;
  copyToClipboard: (text: string, type: 'input' | 'output') => void;
  handleTranslate: () => void;
  conversionResult: ConversionResponse | null;
  copiedOutput: boolean;
}

export default function QueryEditor({
  fromLanguage,
  autoDetect,
  inputCode,
  setInputCode,
  copiedInput,
  copyToClipboard,
  handleTranslate,
  conversionResult,
  copiedOutput,
}: QueryEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="editors-container-grid">
      {/* INPUT PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[480px] shadow-sm" id="panel-input">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${autoDetect ? 'bg-teal-400 animate-pulse' : 'bg-amber-500'}`} />
            {autoDetect 
              ? `Auto-detected Input (${fromLanguage === 'prisma' ? 'Prisma' : 'SQL'})` 
              : fromLanguage === 'prisma' ? 'Prisma Javascript Statement' : 'Source SQL Statement'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(inputCode, 'input')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Copy code"
              id="btn-copy-input"
            >
              {copiedInput ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex font-mono text-xs overflow-hidden relative">
          {/* Line numbers mock representation */}
          <div className="w-10 bg-slate-950/65 border-r border-slate-800 text-slate-600 text-right pr-2.5 pt-3 select-none flex flex-col gap-[3px]">
            {Array.from({ length: Math.max(16, inputCode.split('\n').length) }).map((_, idx) => (
              <div key={idx} className="text-[10px]">{idx + 1}</div>
            ))}
          </div>

          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 bg-slate-950 p-3 text-slate-200 resize-none outline-none overflow-y-auto leading-relaxed focus:bg-slate-950"
            placeholder={
              fromLanguage === 'prisma'
                ? 'Paste any valid Prisma query e.g. prisma.user.findMany({...})'
                : 'Paste any valid SQL query e.g. SELECT * FROM users u LEFT JOIN posts p ON u.id = p.author_id;'
            }
            spellCheck="false"
            id="input-editor-area"
          />
        </div>

        <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info size={12} className="text-amber-400" />
            <span>Changes translate instantly.</span>
          </div>
          <button
            onClick={handleTranslate}
            className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-teal-500/10 flex items-center gap-1 transition-all cursor-pointer"
            id="btn-execute-translate"
          >
            <Play size={12} className="fill-current" />
            Translate Now
          </button>
        </div>
      </div>

      {/* OUTPUT PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[480px] shadow-sm" id="panel-output">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            {fromLanguage === 'prisma' ? 'Compiled SQL' : 'Prisma Javascript Statement'}
          </span>
          <div className="flex items-center gap-2">
            {conversionResult?.success && (
              <button
                onClick={() => copyToClipboard(conversionResult.output, 'output')}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Copy Output"
                id="btn-copy-output"
              >
                {copiedOutput ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>

        {conversionResult?.success ? (
          <div className="flex-1 flex font-mono text-xs overflow-hidden relative">
            <div className="w-10 bg-slate-950/65 border-r border-slate-800 text-slate-600 text-right pr-2.5 pt-3 select-none flex flex-col gap-[3px]">
              {Array.from({ length: Math.max(16, conversionResult.output.split('\n').length) }).map((_, idx) => (
                <div key={idx} className="text-[10px]">{idx + 1}</div>
              ))}
            </div>
            <pre className="flex-1 bg-slate-950 p-3 text-slate-100 overflow-y-auto leading-relaxed select-text whitespace-pre-wrap">
              <code className="text-teal-300">{conversionResult.output}</code>
            </pre>
          </div>
        ) : (
          <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
            {conversionResult?.error ? (
              <div className="max-w-md" id="error-display-box">
                <AlertTriangle className="text-rose-500 mx-auto mb-3" size={36} />
                <div className="text-slate-200 font-bold mb-1 text-sm">Parser Compilation Stopped</div>
                <p className="text-xs text-rose-400 font-mono bg-rose-950/30 border border-rose-900/60 rounded-lg p-3 text-left overflow-x-auto max-h-[180px]">
                  {conversionResult.error}
                </p>
                <div className="text-[11px] text-slate-400 mt-2">
                  Check that your query aligns with target models or supports appropriate AST syntax.
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">
                Provide an input query or choose a template above.
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-950/80 px-4 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-teal-400" />
            Client-side AST Engine Active
          </span>
          {conversionResult?.success && conversionResult.analysis && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              conversionResult.analysis.complexityLevel === 'High' 
                ? 'bg-rose-950 text-rose-300 border border-rose-900' 
                : conversionResult.analysis.complexityLevel === 'Medium'
                ? 'bg-amber-950 text-amber-300 border border-amber-900'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
            }`}>
              {conversionResult.analysis.complexityLevel} Complexity
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
