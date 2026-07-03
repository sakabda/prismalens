import type { PrismaQueryAST, PrismaWhere } from "./types";

export interface QueryAnalysis {
  model: string;
  operation: string;

  tables: string[];
  hasWhere: boolean;
  hasSelect: boolean;
  hasOrderBy: boolean;
  hasPagination: boolean;

  filterCount: number;
  depth: number;

  complexity: "LOW" | "MEDIUM" | "HIGH";

  warnings: string[];
}

export class QueryAnalyzer {
  analyze(ast: PrismaQueryAST): QueryAnalysis {
    const warnings: string[] = [];

    const hasWhere = !!ast.args.where;
    const hasSelect = !!ast.args.select;
    const hasOrderBy = !!ast.args.orderBy;
    const hasPagination =
      ast.args.take !== undefined || ast.args.skip !== undefined;

    const filterCount = this.countFilters(ast.args.where);
    const depth = this.getWhereDepth(ast.args.where);

    // Complexity calculation
    let score = 0;

    if (hasWhere) score += 1;
    if (hasOrderBy) score += 1;
    if (hasPagination) score += 1;
    if (filterCount > 3) score += 2;
    if (depth > 2) score += 2;

    let complexity: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    if (score >= 5) complexity = "HIGH";
    else if (score >= 3) complexity = "MEDIUM";

    // Warnings
    if (filterCount > 5) {
      warnings.push("High number of filters may impact performance.");
    }

    if (depth > 3) {
      warnings.push("Deep nested conditions detected.");
    }

    if (ast.operation === "findMany" && !hasWhere) {
      warnings.push("Full table scan (no WHERE clause).");
    }

    return {
      model: ast.model,
      operation: ast.operation,

      tables: [ast.model],

      hasWhere,
      hasSelect,
      hasOrderBy,
      hasPagination,

      filterCount,
      depth,

      complexity,

      warnings,
    };
  }

  // ---------------------------------------
  // Count filters recursively
  // ---------------------------------------
  private countFilters(where?: PrismaWhere): number {
    if (!where) return 0;

    let count = 0;

    for (const [key, value] of Object.entries(where)) {
      if (key === "AND" || key === "OR" || key === "NOT") {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            count += this.countFilters(v);
          });
        }
        continue;
      }

      count++;
    }

    return count;
  }

  // ---------------------------------------
  // Measure nesting depth
  // ---------------------------------------
  private getWhereDepth(where?: PrismaWhere, level = 0): number {
    if (!where) return level;

    let max = level;

    for (const value of Object.values(where)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          max = Math.max(
            max,
            this.getWhereDepth(v, level + 1),
          );
        }
      } else if (
        value &&
        typeof value === "object"
      ) {
        max = Math.max(
          max,
          this.getWhereDepth(
            value as PrismaWhere,
            level + 1,
          ),
        );
      }
    }

    return max;
  }
}