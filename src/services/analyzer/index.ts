import type { QueryAnalysis, PrismaQueryAST } from "../../types";

/** Count nested object depth. */
function countDepth(obj: unknown, current: number = 0): number {
  if (obj === null || typeof obj !== "object") return current;
  const values = Object.values(obj as Record<string, unknown>);
  if (values.length === 0) return current;
  return Math.max(...values.map((v) => countDepth(v, current + 1)));
}

/** Count all filter conditions recursively. */
function countConditions(obj: unknown): number {
  if (obj === null || typeof obj !== "object") return 0;
  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countConditions(item), 0);
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  let count = 0;
  for (const [key, value] of entries) {
    if (key === "AND" || key === "OR" || key === "NOT") {
      count += countConditions(value);
    } else if (typeof value === "object" && value !== null) {
      count += Object.keys(value).length;
      count += countConditions(value);
    } else {
      count += 1;
    }
  }
  return count;
}

/** Count JOIN operations from include/select. */
function countJoins(args: Record<string, unknown>): number {
  let joins = 0;
  const include = args.include as Record<string, unknown> | undefined;
  const select = args.select as Record<string, unknown> | undefined;

  function countNestedRelations(obj: Record<string, unknown>): number {
    let count = 0;
    for (const [, val] of Object.entries(obj)) {
      if (val === true) {
        count += 1;
      } else if (typeof val === "object" && val !== null) {
        count += 1;
        count += countNestedRelations(val as Record<string, unknown>);
      }
    }
    return count;
  }

  if (include) joins += countNestedRelations(include);
  if (select) joins += countNestedRelations(select);

  return joins;
}

/** Count unique tables involved. */
function countTables(args: Record<string, unknown>): number {
  let tables = 1;
  const include = args.include as Record<string, unknown> | undefined;
  const select = args.select as Record<string, unknown> | undefined;

  function countNested(obj: Record<string, unknown>): number {
    let count = 0;
    for (const [, val] of Object.entries(obj)) {
      if (val === true) {
        count += 1;
      } else if (typeof val === "object" && val !== null) {
        count += 1;
        count += countNested(val as Record<string, unknown>);
      }
    }
    return count;
  }

  if (include) tables += countNested(include);
  if (select) tables += countNested(select);

  return tables;
}

/** Analyze a parsed Prisma query and return performance metrics. */
export function analyzeQuery(ast: PrismaQueryAST | null): QueryAnalysis {
  if (!ast) {
    return {
      score: 0,
      conditions: 0,
      tables: 0,
      joins: 0,
      complexity: "Low",
      nestedDepth: 0,
      estimatedCost: "Low",
      warnings: [],
      bottlenecks: [],
    };
  }

  const { args, operation } = ast;
  const conditions = countConditions(args.where);
  const joins = countJoins(args as unknown as Record<string, unknown>);
  const tables = countTables(args as unknown as Record<string, unknown>);
  const nestedDepth = countDepth(args.where);
  const hasTake = typeof args.take === "number";
  const hasSelect = !!args.select;
  const hasInclude = !!args.include;
  const hasOrderBy = !!args.orderBy;

  let score = 100;
  const warnings: string[] = [];
  const bottlenecks: string[] = [];

  if (conditions > 10) {
    score -= 20;
    bottlenecks.push(
      "Very high number of filter conditions may cause slow query execution.",
    );
  } else if (conditions > 5) {
    score -= 10;
    warnings.push("Consider simplifying filter conditions if possible.");
  }

  if (!hasTake && (operation === "findMany" || operation === "findFirst")) {
    score -= 15;
    warnings.push("Missing take/limit — query may return unbounded results.");
    bottlenecks.push(
      "Unbounded result set can cause memory issues and slow responses.",
    );
  }

  if (!hasSelect && !hasInclude) {
    score -= 10;
    warnings.push("Using SELECT * — specify only needed fields with select.");
  }

  if (hasInclude) {
    const includeObj = args.include as Record<string, unknown>;
    const relCount = Object.keys(includeObj).length;
    if (relCount > 3) {
      score -= 15;
      bottlenecks.push(
        `Loading ${relCount} relations in a single query — potential N+1 or heavy JOIN.`,
      );
    } else if (relCount > 1) {
      score -= 5;
      warnings.push(`Loading ${relCount} relations — verify all are needed.`);
    }

    if (nestedDepth > 2) {
      score -= 15;
      bottlenecks.push(
        `Deeply nested include (depth ${nestedDepth}) — consider splitting into separate queries.`,
      );
    }
  }

  if (joins > 4) {
    score -= 10;
    bottlenecks.push(
      `${joins} JOINs may cause performance degradation on large tables.`,
    );
  }

  if (args.where) {
    const where = args.where as Record<string, unknown>;
    if (where.OR && Array.isArray(where.OR)) {
      const orCount = (where.OR as unknown[]).length;
      if (orCount > 3) {
        score -= 10;
        warnings.push(
          `Multiple OR conditions (${orCount}) — may prevent index usage.`,
        );
      }
    }
  }

  if (hasOrderBy && !hasTake) {
    score -= 5;
    warnings.push("ORDER BY without LIMIT may cause full table sort.");
  }

  if (operation === "findUnique" && !args.where) {
    score -= 5;
    warnings.push("findUnique without where may not behave as expected.");
  }

  score = Math.max(0, Math.min(100, score));

  let complexity: QueryAnalysis["complexity"] = "Low";
  if (score < 30) complexity = "Very High";
  else if (score < 55) complexity = "High";
  else if (score < 80) complexity = "Medium";

  let estimatedCost: QueryAnalysis["estimatedCost"] = "Low";
  if (tables > 3 || joins > 3 || conditions > 8) estimatedCost = "High";
  else if (tables > 1 || joins > 1 || conditions > 3) estimatedCost = "Medium";

  return {
    score,
    conditions,
    tables,
    joins,
    complexity,
    nestedDepth,
    estimatedCost,
    warnings,
    bottlenecks,
  };
}
