
import { useState, useCallback } from "react";
import {
  ArrowRight,
  Sparkles,
  Trash2,
  BookmarkPlus,
  AlignLeft,
  ListChecks,
  TreePine,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import CodeEditor from "../components/CodeEditor";
import CopyButton from "../components/CopyButton";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AnalysisPanel from "../components/converter/AnalysisPanel";
import SuggestionPanel from "../components/converter/SuggestionPanel";
import ASTViewer from "../components/converter/ASTViewer";
import ExampleSidebar from "../components/converter/ExampleSidebar";

import { prismaToSql } from "../services/converter/prisma-to-sql";
import { sqlToPrisma } from "../services/converter/sql-to-prisma";
import { parsePrismaQuery } from "../services/converter/parser";
import { analyzeQuery } from "../services/analyzer";
import { getSuggestions } from "../services/analyzer/suggestions";
import { saveHistory } from "../services/history";
import { saveSnippet } from "../services/snippets";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { cn } from "../utils/cn";

import type {
  ConverterMode,
  BottomTab,
  QueryAnalysis,
  PrismaQueryAST,
} from "../types";
import CreateSnippetModal from "../components/snippets/CreateSnippetModal";

const DEFAULT_PRISMA = `prisma.user.findMany({
  where: {
    email: "test@test.com",
    role: "ADMIN"
  }
})`;

const BOTTOM_TABS: { id: BottomTab; label: string; icon: typeof ListChecks }[] =
  [
    { id: "analysis", label: "Analysis", icon: ListChecks },
    { id: "suggestions", label: "Suggestions", icon: Sparkles },
    { id: "ast", label: "AST", icon: TreePine },
  ];

export default function Converter() {
  const [mode, setMode] = useState<ConverterMode>("prisma-to-sql");
  const [input, setInput] = useState(DEFAULT_PRISMA);
  const [output, setOutput] = useState("");
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [ast, setAst] = useState<PrismaQueryAST | null>(null);
  const [activeTab, setActiveTab] = useState<BottomTab>("analysis");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleConvert = useCallback(() => {
    
    if (!input.trim()) {
      toast.error("Enter a query to convert");
      return;
    }

    setIsConverting(true);

    setTimeout(() => {
      let result = "";
      let parsedAst: PrismaQueryAST | null = null;
      let newAnalysis: QueryAnalysis | null = null;
      let newSuggestions: string[] = [];

      if (mode === "prisma-to-sql") {
        console.log("=== CALLING prismaToSql ===");
        result = prismaToSql(input);
        parsedAst = parsePrismaQuery(input);
        newAnalysis = analyzeQuery(parsedAst);
        newSuggestions = getSuggestions(parsedAst);
      } else {
        result = sqlToPrisma(input);
      }

      setOutput(result);
      setAst(parsedAst);
      setAnalysis(newAnalysis);
      setSuggestions(newSuggestions);
      setIsConverting(false);

      saveHistory(input, result, mode, newAnalysis);
      toast.success("Query converted");
    }, 120);
  }, [input, mode]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setAnalysis(null);
    setSuggestions([]);
    setAst(null);
  }, []);

  // const handleSaveSnippet = useCallback(() => {
  //   if (!input.trim()) {
  //     toast.error("Nothing to save");
  //     return;
  //   }
  //   const name = prompt("Snippet name:");
  //   if (!name?.trim()) return;
  //   saveSnippet(name.trim(), input, mode);
  //   toast.success("Snippet saved");
  // }, [input, mode]);
  const handleSaveSnippet = useCallback(() => {
  if (!input.trim()) {
    toast.error("Nothing to save");
    return;
  }

  setShowSaveDialog(true);
}, [input]);

  const handleExampleSelect = useCallback((query: string) => {
    setInput(query);
    setOutput("");
    setAnalysis(null);
    setSuggestions([]);
    setAst(null);
  }, []);

  useKeyboardShortcuts({
    "mod+enter": handleConvert,
    "mod+s": () => {
      handleSaveSnippet();
    },
  });

  const inputLanguage = mode === "prisma-to-sql" ? "typescript" : "sql";
  const outputLanguage = mode === "prisma-to-sql" ? "sql" : "typescript";
  const inputLabel = mode === "prisma-to-sql" ? "Prisma Query" : "SQL Query";
  const outputLabel = mode === "prisma-to-sql" ? "SQL Output" : "Prisma Output";

  const hasResults =
    analysis !== null || suggestions.length > 0 || ast !== null;

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Query Converter
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {showSidebar ?
              <PanelLeftClose size={15} />
            : <PanelLeftOpen size={15} />}
          </button>

          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              onClick={() => {
                setMode("prisma-to-sql");
                handleClear();
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                mode === "prisma-to-sql" ?
                  "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              Prisma → SQL
            </button>
            <button
              onClick={() => {
                setMode("sql-to-prisma");
                handleClear();
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                mode === "sql-to-prisma" ?
                  "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              SQL → Prisma
            </button>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="flex gap-4">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden shrink-0 overflow-hidden lg:block"
            >
              <Card className="h-115 overflow-hidden">
                <ExampleSidebar onSelect={handleExampleSelect} />
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Editors */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          {/* Input */}
          <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold">{inputLabel}</h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Ctrl+Enter to convert
              </span>
            </div>
            <div className="flex-1">
              <CodeEditor
                language={inputLanguage}
                value={input}
                onChange={setInput}
                height="100%"
              />
            </div>
          </Card>

          {/* Arrow + Convert Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-md disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
              aria-label="Convert query"
            >
              <ArrowRight
                size={18}
                className={cn(
                  "transition-transform",
                  isConverting && "animate-pulse",
                )}
              />
            </button>
          </div>

          {/* Output */}
          <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-semibold">{outputLabel}</h2>
              </div>
              <CopyButton value={output} />
            </div>
            <div className="flex-1">
              <CodeEditor
                language={outputLanguage}
                value={output}
                readOnly
                height="100%"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={handleConvert} disabled={isConverting}>
          <AlignLeft size={15} />
          Convert
        </Button>
        <Button variant="secondary" onClick={handleSaveSnippet}>
          <BookmarkPlus size={15} />
          Save Snippet
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          <Trash2 size={15} />
          Clear
        </Button>
      </div>

      {/* Bottom Analysis Tabs */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <Card className="overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                {BOTTOM_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isDisabled =
                    (tab.id === "analysis" && !analysis) ||
                    (tab.id === "suggestions" && mode !== "prisma-to-sql") ||
                    (tab.id === "ast" && !ast);

                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isDisabled && setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                        isActive ?
                          "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                        isDisabled && "cursor-not-allowed opacity-40",
                      )}
                      disabled={isDisabled}
                    >
                      <Icon size={14} />
                      {tab.label}
                      {tab.id === "suggestions" && suggestions.length > 0 && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          {suggestions.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-5">
                {activeTab === "analysis" && analysis && (
                  <AnalysisPanel analysis={analysis} />
                )}
                {activeTab === "suggestions" && (
                  <SuggestionPanel suggestions={suggestions} />
                )}
                {activeTab === "ast" && <ASTViewer ast={ast} />}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <CreateSnippetModal
  open={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  onSave={(data) => {
    saveSnippet(
      data.name,
      input,
      mode,
      data.tags,
    );

    toast.success("Snippet saved");

    setShowSaveDialog(false);
  }}
/>
    </div>
  );
}
