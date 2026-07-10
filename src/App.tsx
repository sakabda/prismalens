import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  translatePrismaToSql,
  translateSqlToPrisma,
  analyzeQueryStatic,
} from "./lib/parser";
import {
  QueryLanguage,
  DbDialect,
  QuerySchema,
  HistoryItem,
  ConversionResponse,
  AstNode,
} from "./types";
import {
  BLOG_SCHEMA,
  ECOMMERCE_SCHEMA,
  PRISMA_TEMPLATES,
  SQL_TEMPLATES,
} from "./data/templates";

// Component Imports
import Header from "./components/Header";
import ConfigRail from "./components/ConfigRail";
import QueryEditor from "./components/QueryEditor";
import AstViewer from "./components/AstViewer";
import PerformanceAdvisor from "./components/PerformanceAdvisor";
import SchemaDesigner from "./components/SchemaDesigner";
import HistoryManager from "./components/HistoryManager";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function detectLanguage(code: string): QueryLanguage | null {
  const trimmed = code.trim().toLowerCase();
  if (!trimmed) return null;

  // Prisma patterns
  if (
    trimmed.includes("prisma.") ||
    trimmed.includes("findmany") ||
    trimmed.includes("findunique") ||
    trimmed.includes("findfirst") ||
    trimmed.includes("include:") ||
    trimmed.includes("select:") ||
    trimmed.includes("where:")
  ) {
    return "prisma";
  }

  // SQL patterns
  if (
    trimmed.startsWith("select") ||
    trimmed.startsWith("with") ||
    trimmed.startsWith("insert") ||
    trimmed.startsWith("update") ||
    trimmed.startsWith("delete") ||
    trimmed.startsWith("create table") ||
    trimmed.includes("from ") ||
    trimmed.includes("select ") ||
    trimmed.includes("join ")
  ) {
    return "sql";
  }

  // Fallbacks:
  if (trimmed.includes("{") && trimmed.includes(":")) {
    return "prisma";
  }

  if (
    trimmed.includes(";") ||
    trimmed.includes("from") ||
    trimmed.includes("select")
  ) {
    return "sql";
  }

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"convert" | "schema" | "history">(
    "convert",
  );
  const [fromLanguage, setFromLanguage] = useState<QueryLanguage>("prisma");
  const [dialect, setDialect] = useState<DbDialect>("postgresql");
  const [schema, setSchema] = useState<QuerySchema>(BLOG_SCHEMA);
  const [autoDetect, setAutoDetect] = useState<boolean>(true);

  // Custom interactive editing for active schema templates
  const [schemaPresetName, setSchemaPresetName] = useState<string>(
    "Blogging & Team Portal",
  );

  // Query editor states
  const [inputCode, setInputCode] = useState<string>(PRISMA_TEMPLATES[0].code);
  const [conversionResult, setConversionResult] =
    useState<ConversionResponse | null>(null);

  // Copy indicators
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedIndexSql, setCopiedIndexSql] = useState<number | null>(null);

  // AST collapse status
  const [astExpanded, setAstExpanded] = useState<Record<string, boolean>>({
    root: true,
    SelectClause: true,
    RelationsJoin: true,
    FilterClause: true,
    SqlQuery: true,
    SelectFields: true,
    Joins: true,
  });

  // History system
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("prisma_sql_translator_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle AST Nodes
  const toggleAstNode = (id: string) => {
    setAstExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Run Translation on current state
  const handleTranslate = () => {
    if (!inputCode.trim()) return;

    try {
      if (fromLanguage === "prisma") {
        const { sql, ast, baseModel } = translatePrismaToSql(
          inputCode,
          dialect,
          schema,
        );
        const analysis = analyzeQueryStatic(sql, baseModel, schema);

        setConversionResult({
          success: true,
          output: sql,
          ast,
          analysis,
          explanation: `Locally processed Prisma AST to compiled SQL. Resolved primary model mapping: "${capitalize(baseModel)}". Integrated ${analysis.indexSuggestions.length} join optimizations.`,
        });

        // Add to history
        addHistoryItem(inputCode, sql);
      } else {
        const { prisma, ast } = translateSqlToPrisma(
          inputCode,
          dialect,
          schema,
        );
        const baseName = ast.properties?.table || "user";
        const analysis = analyzeQueryStatic(inputCode, baseName, schema);

        setConversionResult({
          success: true,
          output: prisma,
          ast,
          analysis,
          explanation: `Locally parsed the SQL Abstract Syntax representation. Reconstructed query structure to fit nested Prisma includes/select format.`,
        });

        // Add to history
        addHistoryItem(inputCode, prisma);
      }
    } catch (err: any) {
      setConversionResult({
        success: false,
        output: "",
        error: err.message || String(err),
      });
    }
  };

  // Auto-translate on mount or configuration changes
  useEffect(() => {
    if (autoDetect) {
      const detected = detectLanguage(inputCode);
      if (detected && detected !== fromLanguage) {
        setFromLanguage(detected);
        return;
      }
    }
    handleTranslate();
  }, [inputCode, fromLanguage, dialect, schema, autoDetect]);

  const addHistoryItem = (input: string, output: string) => {
    // Avoid redundant duplicates at top of history
    if (
      history.length > 0 &&
      history[0].input === input &&
      history[0].output === output
    ) {
      return;
    }

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      input,
      output,
      fromLanguage,
      dialect,
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // limit to last 50
      localStorage.setItem(
        "prisma_sql_translator_history",
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("prisma_sql_translator_history");
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFromLanguage(item.fromLanguage);
    setDialect(item.dialect);
    setInputCode(item.input);
    setActiveTab("convert");
  };

  const copyToClipboard = (text: string, type: "input" | "output") => {
    navigator.clipboard.writeText(text);
    if (type === "input") {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  const copyIndexSql = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndexSql(idx);
    setTimeout(() => setCopiedIndexSql(null), 2000);
  };

  // Schema Editor Functions
  const updateModelName = (modelIdx: number, newName: string) => {
    const next = { ...schema };
    next.models[modelIdx].name = newName;
    setSchema(next);
  };

  const updateModelDbName = (modelIdx: number, newDbName: string) => {
    const next = { ...schema };
    next.models[modelIdx].dbName = newDbName;
    setSchema(next);
  };

  const updateFieldName = (
    modelIdx: number,
    fieldIdx: number,
    newName: string,
  ) => {
    const next = { ...schema };
    next.models[modelIdx].fields[fieldIdx].name = newName;
    setSchema(next);
  };

  const updateFieldType = (
    modelIdx: number,
    fieldIdx: number,
    newType: string,
  ) => {
    const next = { ...schema };
    const field = next.models[modelIdx].fields[fieldIdx];
    field.type = newType;
    if (newType === "Relation") {
      field.isRelation = true;
      field.relationModel = next.models[0]?.name || "User";
    } else {
      field.isRelation = false;
      delete field.relationModel;
      delete field.relationFields;
      delete field.relationReferences;
    }
    setSchema(next);
  };

  const updateFieldRelationModel = (
    modelIdx: number,
    fieldIdx: number,
    modelName: string,
  ) => {
    const next = { ...schema };
    next.models[modelIdx].fields[fieldIdx].relationModel = modelName;
    setSchema(next);
  };

  const addField = (modelIdx: number) => {
    const next = { ...schema };
    next.models[modelIdx].fields.push({
      name: "newField",
      type: "String",
    });
    setSchema(next);
  };

  const removeField = (modelIdx: number, fieldIdx: number) => {
    const next = { ...schema };
    next.models[modelIdx].fields.splice(fieldIdx, 1);
    setSchema(next);
  };

  const addModel = () => {
    const next = { ...schema };
    next.models.push({
      name: "NewModel",
      fields: [
        { name: "id", type: "Int", isId: true },
        { name: "createdAt", type: "DateTime" },
      ],
    });
    setSchema(next);
  };

  const removeModel = (modelIdx: number) => {
    const next = { ...schema };
    next.models.splice(modelIdx, 1);
    setSchema(next);
  };

  const loadSchemaPreset = (preset: "blog" | "ecommerce") => {
    if (preset === "blog") {
      setSchema(BLOG_SCHEMA);
      setSchemaPresetName("Blogging & Team Portal");
    } else {
      setSchema(ECOMMERCE_SCHEMA);
      setSchemaPresetName("E-commerce & Customers");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
      id="app-container"
    >
      {/* Header Banner */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 w-full flex flex-col" id="workspace-main">
        <AnimatePresence mode="wait">
          {activeTab === "convert" && (
            <motion.div
              key="convert"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="convert-workspace"
            >
              {/* LEFT CONFIGURATION RAIL / QUICK CONTROLS */}
              <ConfigRail
                fromLanguage={fromLanguage}
                setFromLanguage={setFromLanguage}
                autoDetect={autoDetect}
                setAutoDetect={setAutoDetect}
                dialect={dialect}
                setDialect={setDialect}
                schema={schema}
                schemaPresetName={schemaPresetName}
                setActiveTab={setActiveTab}
                setInputCode={setInputCode}
              />

              {/* DUAL WORKSPACE PANEL */}
              <div
                className="lg:col-span-9 flex flex-col gap-6"
                id="editors-container"
              >
                <QueryEditor
                  fromLanguage={fromLanguage}
                  autoDetect={autoDetect}
                  inputCode={inputCode}
                  setInputCode={setInputCode}
                  copiedInput={copiedInput}
                  copyToClipboard={copyToClipboard}
                  handleTranslate={handleTranslate}
                  conversionResult={conversionResult}
                  copiedOutput={copiedOutput}
                />

                {/* DETAILED AST & REALTIME STATIC EXPLANATIONS */}
                {conversionResult?.success && (
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-6"
                    id="analysis-split-view"
                  >
                    {/* COMPILER AST EXPLORER */}
                    <AstViewer
                      ast={conversionResult.ast}
                      astExpanded={astExpanded}
                      toggleAstNode={toggleAstNode}
                    />

                    {/* STATIC PERFORMANCE ADVISOR & INDEX SUGGESTIONS */}
                    <PerformanceAdvisor
                      conversionResult={conversionResult}
                      copiedIndexSql={copiedIndexSql}
                      copyIndexSql={copyIndexSql}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "schema" && (
            <motion.div
              key="schema"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <SchemaDesigner
                schema={schema}
                schemaPresetName={schemaPresetName}
                loadSchemaPreset={loadSchemaPreset}
                updateModelName={updateModelName}
                updateModelDbName={updateModelDbName}
                removeModel={removeModel}
                updateFieldName={updateFieldName}
                updateFieldType={updateFieldType}
                updateFieldRelationModel={updateFieldRelationModel}
                removeField={removeField}
                addField={addField}
                addModel={addModel}
              />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <HistoryManager
                history={history}
                clearHistory={clearHistory}
                loadHistoryItem={loadHistoryItem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Humble Footer info block */}
      <footer
        className="border-t border-slate-800 bg-slate-900/40 px-6 py-4 mt-8 text-center text-xs text-slate-500"
        id="footer-section"
      >
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
          <span>
            Prisma & SQL Query Translator • Deterministic AST Parsing
            Engine
          </span>
          <span>Built with ❤️ by <strong>Sakabda Das</strong></span>
        </div>
      </footer>
    </div>
  );
}
