import React, { useState } from "react";
import {
  translatePrismaToSql,
  translateSqlToPrisma,
  analyzeQueryStatic,
} from "../lib/parser";
import { DbDialect, QuerySchema } from "../types";
import { BLOG_SCHEMA, ECOMMERCE_SCHEMA } from "../data/templates";
import {
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  FileText,
  Code2,
  Terminal,
  Lightbulb,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  category: "Prisma" | "SQL";
  description: string;
  input: string;
  schema: QuerySchema;
  schemaLabel: string;
}

const TEST_CASES: TestCase[] = [
  // 1. Prisma: Deep Relation Fetching
  {
    id: "prisma-nested-joins",
    name: "Deep Relational Joins",
    category: "Prisma",
    description: "Fetch Authors with published Posts and nested post Comments",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.user.findMany({
  where: {
    role: 'AUTHOR',
    posts: {
      some: {
        published: true
      }
    }
  },
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
        comments: {
          select: {
            id: true,
            text: true
          }
        }
      }
    }
  }
})`,
  },
  // 2. Prisma: Compound Operators
  {
    id: "prisma-boolean-operators",
    name: "Compound Boolean Operators (AND, OR, NOT)",
    category: "Prisma",
    description:
      'Filter posts containing "Prisma" with complex author and comment exclusion constraints',
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      { title: { contains: 'Prisma' } }
    ],
    OR: [
      { authorId: { gte: 100 } },
      { comments: { none: { authorId: 5 } } }
    ],
    NOT: {
      content: { startsWith: 'Draft' }
    }
  },
  include: {
    author: true
  }
})`,
  },
  // 3. Prisma: E-Commerce Customers with Order Items
  {
    id: "prisma-ecommerce-join",
    name: "E-commerce Dynamic Join & Filters",
    category: "Prisma",
    description:
      "Query Customer list with status-specific nested Orders and Items",
    schema: ECOMMERCE_SCHEMA,
    schemaLabel: "E-commerce Schema",
    input: `prisma.customer.findMany({
  where: {
    email: { endsWith: '@gmail.com' }
  },
  select: {
    fullName: true,
    orders: {
      where: {
        status: 'DELIVERED'
      },
      select: {
        totalAmount: true,
        items: true
      }
    }
  }
})`,
  },
  // 4. Prisma: Pagination and Sorting
  {
    id: "prisma-paging-sorting",
    name: "Pagination, Ordering, Limits & Offsets",
    category: "Prisma",
    description:
      "Pagination testing using take, skip, and multi-field object ordering",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.user.findMany({
  where: {
    role: 'ADMIN'
  },
  orderBy: {
    name: 'desc'
  },
  take: 15,
  skip: 30
})`,
  },
  // 5. Prisma: Simple Primary Key Lookup
  {
    id: "prisma-pk-lookup",
    name: "Primary Key Direct Lookup (findUnique)",
    category: "Prisma",
    description:
      "Direct unique query mapping to a single SQL record with a select projection",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.user.findUnique({
  where: {
    id: 42
  },
  select: {
    email: true,
    name: true
  }
})`,
  },
  // 6. Prisma: StartsWith & EndsWith Wildcards
  {
    id: "prisma-wildcards",
    name: "Text Wildcard Constraints",
    category: "Prisma",
    description:
      "Translates startsWith, endsWith, and contains filters to LIKE statements",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.comment.findMany({
  where: {
    text: { startsWith: 'A' },
    OR: [
      { text: { endsWith: '!' } },
      { text: { contains: 'bug' } }
    ]
  }
})`,
  },
  // 7. Prisma: Empty Filters / All Records
  {
    id: "prisma-all-records",
    name: "Unconditional Select (All Records)",
    category: "Prisma",
    description:
      "Testing translator execution with empty criteria, pulling entire table schemas",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `prisma.post.findMany({})`,
  },

  // 8. SQL: Multi-Table Join Projections
  {
    id: "sql-multi-join",
    name: "Multi-table Left Joins",
    category: "SQL",
    description:
      "Retrieve users joined with author posts and specific comment texts",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `SELECT
  u.id,
  u.email AS user_email,
  p.title AS post_title,
  c.text AS comment_content
FROM users AS u
LEFT JOIN posts AS p ON u.id = p.authorId
LEFT JOIN comments AS c ON p.id = c.postId
WHERE u.role = 'ADMIN' AND p.published = true
ORDER BY u.name DESC
LIMIT 50
OFFSET 0;`,
  },
  // 9. SQL: Strict Filters with Wildcards
  {
    id: "sql-like-filters",
    name: "SQL Wildcards to Prisma contains",
    category: "SQL",
    description:
      "Translates standard SQL LIKE conditions back to safe Prisma objects",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `SELECT
  posts.id,
  posts.title
FROM posts AS posts
WHERE posts.published = true 
  AND posts.title LIKE '%Relational%'
ORDER BY posts.id ASC;`,
  },
  // 10. SQL: Customer & Orders Join
  {
    id: "sql-ecommerce-join",
    name: "SQL E-commerce Customer Profile",
    category: "SQL",
    description:
      "Complex SQL statement linking customers, nested orders, and totals",
    schema: ECOMMERCE_SCHEMA,
    schemaLabel: "E-commerce Schema",
    input: `SELECT
  c.id,
  c.fullName,
  o.id AS order_id,
  o.totalAmount
FROM customers AS c
INNER JOIN orders AS o ON c.id = o.customerId
WHERE o.status = 'DELIVERED' AND o.totalAmount > 150.00
ORDER BY o.totalAmount DESC;`,
  },
  // 11. SQL: Group By & Count Warnings
  {
    id: "sql-complex-groupby",
    name: "SQL Projections with Compound Criteria",
    category: "SQL",
    description:
      "Validate complex SQL statements with multiple filter expressions",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `SELECT
  u.id,
  u.email,
  u.name
FROM users AS u
WHERE u.role = 'AUTHOR' AND (u.id > 10 OR u.id < 5);`,
  },
  // 12. SQL: Single record projection
  {
    id: "sql-single-pk",
    name: "SQL Primary Key Filter",
    category: "SQL",
    description:
      "Translates exact ID matching statement into single item retrieval",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `SELECT id, email FROM users WHERE id = 101 LIMIT 1;`,
  },
  // 13. SQL: Multi-column pagination
  {
    id: "sql-paging-sorting",
    name: "SQL Paging Limits & Sort Keys",
    category: "SQL",
    description: "Standard ordering keys converted into Prisma structure",
    schema: BLOG_SCHEMA,
    schemaLabel: "Blogging Schema",
    input: `SELECT * FROM comments WHERE postId = 99 ORDER BY id DESC LIMIT 10 OFFSET 20;`,
  },
];

interface TestResult {
  caseId: string;
  success: boolean;
  translated: string;
  executionTimeMs: number;
  warningsCount: number;
  indexSuggestionsCount: number;
  error?: string;
}

interface TestSuiteProps {
  onLoadTest: (
    input: string,
    category: "Prisma" | "SQL",
    schema: QuerySchema,
  ) => void;
}

export default function TestSuite({ onLoadTest }: TestSuiteProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    TEST_CASES[0].id,
  );
  const [dialect, setDialect] = useState<DbDialect>("postgresql");
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {},
  );
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const activeCase =
    TEST_CASES.find((c) => c.id === selectedCaseId) || TEST_CASES[0];

  const runTestCase = (testCase: TestCase): TestResult => {
    const startTime = performance.now();
    try {
      if (testCase.category === "Prisma") {
        const { sql, baseModel } = translatePrismaToSql(
          testCase.input,
          dialect,
          testCase.schema,
        );
        const analysis = analyzeQueryStatic(sql, baseModel, testCase.schema);
        const endTime = performance.now();
        return {
          caseId: testCase.id,
          success: true,
          translated: sql,
          executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
          warningsCount: analysis.warnings.length,
          indexSuggestionsCount: analysis.indexSuggestions.length,
        };
      } else {
        const { prisma, ast } = translateSqlToPrisma(
          testCase.input,
          dialect,
          testCase.schema,
        );
        const baseName = ast.properties?.table || "user";
        const analysis = analyzeQueryStatic(
          testCase.input,
          baseName,
          testCase.schema,
        );
        const endTime = performance.now();
        return {
          caseId: testCase.id,
          success: true,
          translated: prisma,
          executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
          warningsCount: analysis.warnings.length,
          indexSuggestionsCount: analysis.indexSuggestions.length,
        };
      }
    } catch (err: any) {
      const endTime = performance.now();
      return {
        caseId: testCase.id,
        success: false,
        translated: "",
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
        warningsCount: 0,
        indexSuggestionsCount: 0,
        error: err.message || String(err),
      };
    }
  };

  const runAllTests = () => {
    setIsRunningAll(true);
    const results: Record<string, TestResult> = {};

    // Simulate minor delay for premium animation feel
    setTimeout(() => {
      TEST_CASES.forEach((tc) => {
        results[tc.id] = runTestCase(tc);
      });
      setTestResults(results);
      setIsRunningAll(false);
    }, 400);
  };

  const handleRunSingle = (tc: TestCase) => {
    const res = runTestCase(tc);
    setTestResults((prev) => ({
      ...prev,
      [tc.id]: res,
    }));
  };

  // Pre-run first case result on mount if none exists
  const activeResult = testResults[activeCase.id] || runTestCase(activeCase);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      id="test-suite-workspace"
    >
      {/* LEFT COLUMN: Test Cases Navigation & Overall Status */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Bulk Action Panel */}
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4"
          id="bulk-tests-panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="text-teal-400" size={18} />
              <h2 className="font-bold text-slate-200">
                Query Compiler Matrix
              </h2>
            </div>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 text-teal-400 font-medium">
              {TEST_CASES.length} Test Cases
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Verify the offline parser against a matrix of nested Prisma
            structures, boolean criteria, join models, text operators, and SQL
            syntax patterns.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Compiler Engine
              </span>
              <span className="text-xs font-bold text-slate-300 mt-0.5">
                Offline AST Parser
              </span>
            </div>
            <div className="flex flex-col bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Avg Parse Time
              </span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5">
                &lt; 1 ms
              </span>
            </div>
          </div>

          {/* Dialect selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">
              Target DB Dialect for SQL compilation:
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(["postgresql", "mysql", "sqlite"] as DbDialect[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDialect(d);
                    // Clear existing outcomes to force fresh runs
                    setTestResults({});
                  }}
                  className={`py-1 text-[10px] font-bold rounded capitalize transition-all cursor-pointer ${
                    dialect === d ?
                      "bg-slate-800 text-teal-400 shadow"
                    : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/10 disabled:opacity-50"
            id="btn-run-all-tests"
          >
            <RefreshCw
              size={14}
              className={isRunningAll ? "animate-spin" : ""}
            />
            {isRunningAll ? "Running Tests..." : "Run All compiler Tests"}
          </button>
        </div>

        {/* Test Cases List */}
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar"
          id="test-list-container"
        >
          <div className="text-xs font-semibold text-slate-400 px-2 pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>Query Category & Title</span>
            <span>Status</span>
          </div>
          {TEST_CASES.map((tc) => {
            const res = testResults[tc.id];
            const isSelected = tc.id === selectedCaseId;
            return (
              <div
                key={tc.id}
                onClick={() => setSelectedCaseId(tc.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-left ${
                  isSelected ?
                    "bg-slate-800/80 border-teal-500/50 shadow-md"
                  : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        tc.category === "Prisma" ?
                          "bg-teal-500/10 text-teal-400"
                        : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {tc.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {tc.schemaLabel}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate mt-1">
                    {tc.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {res ?
                    res.success ?
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={10} />
                        <span>{res.executionTimeMs}ms</span>
                      </div>
                    : <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle size={10} />
                        <span>Err</span>
                      </div>

                  : <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunSingle(tc);
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-teal-400 transition"
                      title="Run Case"
                    >
                      <Play size={12} />
                    </button>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Test Case Details & Sandbox Projections */}
      <div
        className="lg:col-span-8 flex flex-col gap-4"
        id="test-details-panel"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded uppercase ${
                    activeCase.category === "Prisma" ?
                      "bg-teal-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                  }`}
                >
                  {activeCase.category} Case
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  • Schema: {activeCase.schemaLabel}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100">
                {activeCase.name}
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                {activeCase.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <button
                onClick={() =>
                  onLoadTest(
                    activeCase.input,
                    activeCase.category,
                    activeCase.schema,
                  )
                }
                className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                id="btn-load-test-workspace"
                title="Load into Query Translator Workspace"
              >
                <ExternalLink size={13} />
                Load in Workspace
              </button>
              <button
                onClick={() => handleRunSingle(activeCase)}
                className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                id="btn-test-run-single"
              >
                <Play size={13} />
                Re-Run Case
              </button>
            </div>
          </div>

          {/* Code Translation View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Query */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  {activeCase.category === "Prisma" ?
                    <Code2 size={13} className="text-teal-400" />
                  : <Terminal size={13} className="text-emerald-400" />}
                  <span>
                    Input{" "}
                    {activeCase.category === "Prisma" ?
                      "Prisma Code"
                    : "Raw SQL"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  AST Input
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs overflow-x-auto min-h-[220px] max-h-[300px] text-slate-300 select-all whitespace-pre">
                {activeCase.input}
              </div>
            </div>

            {/* Compiled Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  {activeCase.category === "Prisma" ?
                    <Terminal size={13} className="text-emerald-400" />
                  : <Code2 size={13} className="text-teal-400" />}
                  <span>
                    Compiled{" "}
                    {activeCase.category === "Prisma" ?
                      "SQL Output"
                    : "Prisma Output"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Parser Outcome
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs overflow-x-auto min-h-[220px] max-h-[300px] text-teal-300 relative select-all">
                {activeResult.success ?
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {activeResult.translated}
                  </div>
                : <div className="text-rose-400 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle size={13} />
                      <span>Parsing Error</span>
                    </div>
                    <p className="bg-rose-950/20 p-2.5 rounded border border-rose-900/40 font-semibold leading-relaxed mt-1">
                      {activeResult.error}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Test Metadata & Analytics */}
          {activeResult.success && (
            <div
              className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col gap-3"
              id="test-analytics"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Activity size={13} className="text-teal-400" />
                <span>Compiler Diagnostic Outcome</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Verification
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passed
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Compilation Time
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-1">
                    {activeResult.executionTimeMs} ms
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Join Recommendations
                  </span>
                  <span className="text-xs font-bold mt-1 text-teal-400">
                    {activeResult.indexSuggestionsCount} Recommended
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Index Alerts
                  </span>
                  <span className="text-xs font-bold mt-1 text-slate-300">
                    {activeResult.warningsCount} Schema alerts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Protip */}
          <div
            className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex gap-3 items-start"
            id="test-tip"
          >
            <Lightbulb
              className="text-amber-400 shrink-0 mt-0.5 animate-pulse"
              size={15}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-300">
                Dynamic Testing Guidance
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click <strong>"Load in Workspace"</strong> to modify fields,
                tweak models, test MySQL vs Sqlite compilation, or render the
                interactive visual AST Nodes inside the main compiler.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
