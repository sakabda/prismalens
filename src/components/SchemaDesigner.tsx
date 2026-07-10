import React from 'react';
import { Database, Trash2, Plus } from 'lucide-react';
import { QuerySchema } from '../types';

interface SchemaDesignerProps {
  schema: QuerySchema;
  schemaPresetName: string;
  loadSchemaPreset: (preset: 'blog' | 'ecommerce') => void;
  updateModelName: (modelIdx: number, newName: string) => void;
  updateModelDbName: (modelIdx: number, newDbName: string) => void;
  removeModel: (modelIdx: number) => void;
  updateFieldName: (modelIdx: number, fieldIdx: number, newName: string) => void;
  updateFieldType: (modelIdx: number, fieldIdx: number, newType: string) => void;
  updateFieldRelationModel: (modelIdx: number, fieldIdx: number, modelName: string) => void;
  removeField: (modelIdx: number, fieldIdx: number) => void;
  addField: (modelIdx: number) => void;
  addModel: () => void;
}

export default function SchemaDesigner({
  schema,
  schemaPresetName,
  loadSchemaPreset,
  updateModelName,
  updateModelDbName,
  removeModel,
  updateFieldName,
  updateFieldType,
  updateFieldRelationModel,
  removeField,
  addField,
  addModel,
}: SchemaDesignerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fadeIn" id="schema-designer-workspace">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Database className="text-teal-400" size={18} />
            Database Schema Configurator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Define tables, fields, and relation keys to ensure accurate table alias resolution during translations.
          </p>
        </div>

        {/* Template Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Load Template:</span>
          <button
            onClick={() => loadSchemaPreset('blog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              schemaPresetName === 'Blogging & Team Portal'
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            id="btn-preset-blog"
          >
            Blogging Schema
          </button>
          <button
            onClick={() => loadSchemaPreset('ecommerce')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              schemaPresetName === 'E-commerce & Customers'
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            id="btn-preset-ecommerce"
          >
            E-commerce Schema
          </button>
        </div>
      </div>

      {/* Model list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="schema-grid-list">
        {schema.models.map((model, modelIdx) => (
          <div key={modelIdx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 relative flex flex-col justify-between" id={`schema-model-${modelIdx}`}>
            <div>
              {/* Model Header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-1">
                  <Database size={15} className="text-emerald-400" />
                  <input
                    type="text"
                    value={model.name}
                    onChange={(e) => updateModelName(modelIdx, e.target.value)}
                    className="bg-slate-900 text-slate-200 font-bold font-mono text-xs px-2 py-1 rounded border border-slate-800 focus:border-teal-500/50 outline-none w-28"
                  />
                  <span className="text-[10px] text-slate-500">Maps to db:</span>
                  <input
                    type="text"
                    value={model.dbName || ''}
                    placeholder={model.name.toLowerCase() + 's'}
                    onChange={(e) => updateModelDbName(modelIdx, e.target.value)}
                    className="bg-slate-900 text-slate-400 font-mono text-[10px] px-1.5 py-1 rounded border border-slate-800 focus:border-teal-500/50 outline-none w-28"
                  />
                </div>
                <button
                  onClick={() => removeModel(modelIdx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Table"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Fields List */}
              <div className="space-y-2.5 mb-4">
                {model.fields.map((field, fieldIdx) => (
                  <div key={fieldIdx} className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 text-xs">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateFieldName(modelIdx, fieldIdx, e.target.value)}
                      className="bg-slate-950 text-slate-300 font-mono text-[11px] px-2 py-1 rounded border border-slate-800/60 focus:border-teal-500/50 outline-none flex-1"
                    />
                    
                    <select
                      value={field.isRelation ? 'Relation' : field.type}
                      onChange={(e) => updateFieldType(modelIdx, fieldIdx, e.target.value)}
                      className="bg-slate-950 text-slate-400 font-mono text-[11px] px-2 py-1 rounded border border-slate-800/60 focus:border-teal-500/50 outline-none"
                    >
                      <option value="Int">Int</option>
                      <option value="String">String</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Float">Float</option>
                      <option value="DateTime">DateTime</option>
                      <option value="Relation">Relation</option>
                    </select>

                    {field.isRelation && (
                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-800/60 px-1.5 py-1 rounded">
                        <span className="text-[9px] text-slate-500">To:</span>
                        <select
                          value={field.relationModel || ''}
                          onChange={(e) => updateFieldRelationModel(modelIdx, fieldIdx, e.target.value)}
                          className="bg-transparent text-teal-400 font-mono text-[9px] outline-none border-none"
                        >
                          {schema.models.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => removeField(modelIdx, fieldIdx)}
                      className="p-1 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => addField(modelIdx)}
              className="w-full py-1.5 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/10 hover:bg-slate-900/20 text-slate-400 hover:text-slate-300 text-xs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={12} />
              Add Field Definition
            </button>
          </div>
        ))}

        {/* Add New Model Card */}
        <button
          onClick={addModel}
          className="border-2 border-dashed border-slate-800 hover:border-teal-500/40 bg-slate-950/20 hover:bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-400 hover:text-teal-400 group min-h-[220px] transition-all cursor-pointer"
          id="btn-add-model"
        >
          <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Add Database Table Model</span>
          <span className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
            Build schema relations for nested join resolutions
          </span>
        </button>
      </div>
    </div>
  );
}
