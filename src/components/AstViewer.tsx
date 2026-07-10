import React from 'react';
import { GitBranch, ChevronRight, ChevronDown } from 'lucide-react';
import { AstNode } from '../types';

interface AstViewerProps {
  ast: AstNode | undefined;
  astExpanded: Record<string, boolean>;
  toggleAstNode: (id: string) => void;
}

export default function AstViewer({ ast, astExpanded, toggleAstNode }: AstViewerProps) {
  
  // Render AST tree recursively
  const renderAstNode = (node: AstNode, depth = 0, pathId = 'root') => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = astExpanded[pathId] ?? true;

    return (
      <div key={pathId} className="pl-4 select-none" id={`ast-node-${pathId}`}>
        <div className="flex items-center gap-1.5 py-1 hover:bg-slate-800/40 rounded px-1 transition-colors">
          {hasChildren ? (
            <button 
              onClick={() => toggleAstNode(pathId)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 block" />
          )}

          <span className="text-teal-400 font-mono text-xs font-semibold">[{node.type}]</span>
          
          {node.name && (
            <span className="text-slate-200 text-xs font-medium font-mono">
              {node.name}
            </span>
          )}

          {node.value && (
            <span className="text-emerald-400 text-xs font-mono truncate max-w-[240px]">
              {typeof node.value === 'string' ? `"${node.value}"` : String(node.value)}
            </span>
          )}

          {node.properties && Object.keys(node.properties).length > 0 && (
            <div className="flex gap-2">
              {Object.entries(node.properties).map(([k, v]) => (
                <span key={k} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-700/60 ml-2">
            {node.children?.map((child, idx) => 
              renderAstNode(child, depth + 1, `${pathId}-${idx}`)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col" id="panel-ast-tree">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Query Abstract Syntax Tree (AST)
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
          Node mapping path keys
        </span>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800/60 rounded-xl p-4 overflow-y-auto max-h-[350px] font-mono text-xs">
        {ast ? (
          renderAstNode(ast)
        ) : (
          <div className="text-slate-500 text-center py-4">No AST representation available.</div>
        )}
      </div>
    </div>
  );
}
