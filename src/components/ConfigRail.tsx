import React from 'react';
import { ArrowLeftRight, Sparkles, Database, Layers, BookOpen } from 'lucide-react';
import { QueryLanguage, DbDialect, QuerySchema } from '../types';
import { PRISMA_TEMPLATES, SQL_TEMPLATES } from '../data/templates';

interface ConfigRailProps {
  fromLanguage: QueryLanguage;
  setFromLanguage: (lang: QueryLanguage) => void;
  autoDetect: boolean;
  setAutoDetect: (auto: boolean) => void;
  dialect: DbDialect;
  setDialect: (dialect: DbDialect) => void;
  schema: QuerySchema;
  schemaPresetName: string;
  setActiveTab: (tab: 'convert' | 'schema' | 'history') => void;
  setInputCode: (code: string) => void;
}

export default function ConfigRail({
  fromLanguage,
  setFromLanguage,
  autoDetect,
  setAutoDetect,
  dialect,
  setDialect,
  schema,
  schemaPresetName,
  setActiveTab,
  setInputCode,
}: ConfigRailProps) {
  return (
    <div className="lg:col-span-3 flex flex-col gap-5" id="config-rail">
      {/* Query Direction */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm" id="box-direction">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ArrowLeftRight size={13} className="text-teal-400" />
          Translation Direction
        </h2>
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800/50">
          <button
            onClick={() => {
              setFromLanguage('prisma');
              setInputCode(PRISMA_TEMPLATES[0].code);
            }}
            className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
              fromLanguage === 'prisma'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="btn-from-prisma"
          >
            Prisma → SQL
          </button>
          <button
            onClick={() => {
              setFromLanguage('sql');
              setInputCode(SQL_TEMPLATES[0].code);
            }}
            className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
              fromLanguage === 'sql'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="btn-from-sql"
          >
            SQL → Prisma
          </button>
        </div>
        
        {/* Auto-detect Toggle */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-teal-400" />
            Auto-detect Input
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="sr-only peer"
              id="checkbox-autodetect"
            />
            <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-focus:ring-0 dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500 peer-checked:after:bg-slate-950"></div>
          </label>
        </div>
      </div>

      {/* Dialect Selection */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm" id="box-dialect">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Database size={13} className="text-teal-400" />
          SQL Engine Dialect
        </h2>
        <div className="flex flex-col gap-1.5">
          {(['postgresql', 'mysql', 'sqlite'] as DbDialect[]).map((d) => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                dialect === d
                  ? 'bg-slate-800/80 border-teal-500/50 text-teal-400 font-bold'
                  : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:border-slate-700'
              }`}
              id={`dialect-${d}`}
            >
              <span className="capitalize">{d === 'postgresql' ? 'PostgreSQL' : d === 'mysql' ? 'MySQL' : 'SQLite'}</span>
              {dialect === d && <div className="w-2 h-2 rounded-full bg-teal-400 shadow-md shadow-teal-400/50" />}
            </button>
          ))}
        </div>
      </div>

      {/* Active Schema mapping state */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm" id="box-active-schema">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-teal-400" />
            Active Schema Target
          </h2>
          <button 
            onClick={() => setActiveTab('schema')}
            className="text-[10px] text-teal-400 hover:underline font-bold cursor-pointer"
          >
            Edit
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 text-xs">
          <div className="text-slate-200 font-bold mb-1 flex items-center gap-1">
            <Database size={12} className="text-emerald-400" />
            {schemaPresetName}
          </div>
          <div className="text-slate-400 text-[11px] mb-2">
            Used to accurately map primary/foreign keys and format relations in compiled outputs.
          </div>
          <div className="flex flex-wrap gap-1">
            {schema.models.map(m => (
              <span key={m.name} className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Templates Selector */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm flex-1" id="box-templates">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookOpen size={13} className="text-teal-400" />
          Complex Presets
        </h2>
        <div className="flex flex-col gap-2">
          {(fromLanguage === 'prisma' ? PRISMA_TEMPLATES : SQL_TEMPLATES).map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => setInputCode(tmpl.code)}
              className="text-left p-2.5 rounded-lg border border-slate-800/60 bg-slate-950/70 hover:border-teal-500/40 hover:bg-slate-950 text-xs transition-all group cursor-pointer"
              id={`template-btn-${idx}`}
            >
              <div className="text-slate-200 font-semibold group-hover:text-teal-300 mb-1 leading-snug">
                {tmpl.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {tmpl.code.substring(0, 45)}...
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
