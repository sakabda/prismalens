import type { PrismaQueryAST } from "../../types";

/** Generate optimization suggestions for a parsed Prisma query. */
export function getSuggestions(ast: PrismaQueryAST | null): string[] {
  if (!ast) return [];

  const { args, operation, model } = ast;
  const suggestions: string[] = [];

  const isReadOp = ["findMany", "findFirst", "findUnique"].includes(operation);

  if (isReadOp) {
    if (!args.take && operation === "findMany") {
      suggestions.push(
        "Add pagination with take/skip to prevent fetching unbounded rows.",
      );
    }

    if (!args.select && !args.include) {
      suggestions.push(
        "Use select to fetch only the fields you need instead of SELECT *.",
      );
    }

    if (args.include) {
      const includeObj = args.include as Record<string, unknown>;
      const relKeys = Object.keys(includeObj);
      for (const rel of relKeys) {
        const val = includeObj[rel];
        if (val === true) {
          suggestions.push(
            `Relation "${rel}" is loaded without select — consider selecting specific fields from ${rel}.`,
          );
        }
      }
      if (relKeys.length > 2) {
        suggestions.push(
          "Multiple relations loaded in one query — consider splitting into separate queries to avoid Cartesian product issues.",
        );
      }
    }

    if (args.where) {
      const where = args.where as Record<string, unknown>;
      if (where.OR && Array.isArray(where.OR)) {
        suggestions.push(
          "OR conditions can prevent index usage. Consider restructuring the query or adding a composite index.",
        );
      }
      if (where.NOT) {
        suggestions.push(
          "NOT filters may cause full table scans. Test with EXPLAIN ANALYZE.",
        );
      }

      function checkStringFilters(obj: Record<string, unknown>) {
        for (const [key, val] of Object.entries(obj)) {
          if (key === "AND" || key === "OR" || key === "NOT") continue;
          if (typeof val === "object" && val !== null) {
            const ops = val as Record<string, unknown>;
            if (ops.contains || ops.startsWith || ops.endsWith) {
              suggestions.push(
                `String filter on "${key}" requires a LIKE operation — ensure a proper index exists (e.g., pg_trgm for PostgreSQL).`,
              );
            }
            if (ops.in || ops.notIn) {
              suggestions.push(
                `IN/NOT IN on "${key}" — for large lists, consider using a JOIN with a temp table instead.`,
              );
            }
          }
        }
      }
      checkStringFilters(where);
    }

    if (args.orderBy && !args.take) {
      suggestions.push(
        "ORDER BY without LIMIT forces the database to sort all matching rows.",
      );
    }

    if (args.cursor) {
      suggestions.push(
        "Cursor-based pagination is efficient for large datasets — good choice.",
      );
    }
  }

  if (operation === "create" || operation === "update") {
    if (args.data) {
      const data = args.data as Record<string, unknown>;
      const nestedCreates = Object.entries(data).filter(
        ([, val]) =>
          typeof val === "object" &&
          val !== null &&
          !Array.isArray(val) &&
          "create" in (val as Record<string, unknown>),
      );
      if (nestedCreates.length > 0) {
        suggestions.push(
          "Nested creates generate multiple queries — consider using a transaction for data consistency.",
        );
      }
    }
  }

  if (operation === "delete" || operation === "deleteMany") {
    suggestions.push(
      "Ensure cascading deletes are configured in your schema or handle related records explicitly.",
    );
  }

  if (operation === "upsert") {
    suggestions.push(
      "Upsert requires a unique constraint on the conflict column — verify your schema has the appropriate @@unique or @unique.",
    );
  }

  if (operation === "aggregate" || operation === "groupBy") {
    suggestions.push(
      "Aggregation queries benefit from indexes on the grouped columns and filtered columns.",
    );
  }

  const where = args.where as Record<string, unknown> | undefined;
  if (where) {
    function findEqualityFields(obj: Record<string, unknown>, prefix = "") {
      for (const [key, val] of Object.entries(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (key === "AND" || key === "OR" || key === "NOT") {
          if (Array.isArray(val)) {
            val.forEach((item) =>
              findEqualityFields(item as Record<string, unknown>, fullPath),
            );
          }
        } else if (typeof val !== "object" || val === null) {
          suggestions.push(
            `Consider adding an index on "${model}.${key}" for equality lookups.`,
          );
        } else {
          const ops = val as Record<string, unknown>;
          if (ops.equals !== undefined) {
            suggestions.push(
              `Consider adding an index on "${model}.${key}" for equality lookups.`,
            );
          }
          if (ops.gt !== undefined || ops.gte !== undefined) {
            suggestions.push(
              `Range filter on "${model}.${key}" may benefit from a B-tree index.`,
            );
          }
        }
      }
    }
    findEqualityFields(where);
  }

  const unique = [...new Set(suggestions)];
  if (unique.length === 0) {
    unique.push("Query looks well-optimized. No suggestions at this time.");
  }

  return unique;
}
