import {
  extractColumns,
  extractLimit,
  extractOffset,
  extractTableName,
} from "./prisma/helpers";

import { sqlSelectToPrisma } from "./prisma/select";
import { sqlWhereToPrisma } from "./prisma/where";
import { sqlPaginationToPrisma } from "./prisma/pagination";

export function sqlToPrisma(sql: string): string {
  const normalized = sql.trim();

  if (!normalized) return "// Empty SQL";

  const upper = normalized.toUpperCase();

  if (upper.startsWith("SELECT")) return convertSelect(normalized);

  if (upper.startsWith("INSERT"))
    return "// INSERT conversion coming next";

  if (upper.startsWith("UPDATE"))
    return "// UPDATE conversion coming next";

  if (upper.startsWith("DELETE"))
    return "// DELETE conversion coming next";

  return "// Unsupported SQL";
}

// --------------------------------------

function convertSelect(sql: string): string {
  const table = extractTableName(sql);
  const columns = extractColumns(sql);
  const limit = extractLimit(sql);
  const offset = extractOffset(sql);

  const whereClause = sql.match(
    /WHERE(.*?)(ORDER BY|GROUP BY|LIMIT|OFFSET|$)/i,
  );

  const where = whereClause
    ? sqlWhereToPrisma(whereClause[1].trim())
    : {};

  const select = sqlSelectToPrisma(columns);
  const pagination = sqlPaginationToPrisma(limit, offset);

  const parts: string[] = [];

  parts.push(`prisma.${table}.findMany({`);

  if (Object.keys(select).length) {
    parts.push(`  select: ${formatObject(select)},`);
  }

  if (Object.keys(where).length) {
    parts.push(`  where: ${formatObject(where)},`);
  }

  if (Object.keys(pagination).length) {
    parts.push(`  ${formatObject(pagination)},`);
  }

  parts.push(`})`);

  return parts.join("\n");
}

// --------------------------------------

function formatObject(obj: any): string {
  return JSON.stringify(obj, null, 2);
}