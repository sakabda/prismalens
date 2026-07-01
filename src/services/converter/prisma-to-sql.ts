import type { PrismaQueryAST, PrismaOperation } from "../../types";

const VALID_OPERATIONS = new Set<string>([
  "findMany", "findFirst", "findUnique", "create", "createMany",
  "update", "updateMany", "delete", "deleteMany", "upsert",
  "aggregate", "count", "groupBy",
]);

function extractCallArgs(input: string, openIndex: number): string | null {
  let depth = 0, inString: string | null = null, escape = false;
  for (let i = openIndex; i < input.length; i++) {
    const ch = input[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (inString) { if (ch === inString) inString = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return input.slice(openIndex + 1, i);
    }
  }
  return null;
}

function splitTopLevel(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0, current = "", inString: string | null = null, escape = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; current += ch; continue; }
    if (ch === "\\") { escape = true; current += ch; continue; }
    if (inString) { current += ch; if (ch === inString) inString = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; current += ch; continue; }
    if (ch === "{" || ch === "[" || ch === "(") { depth++; current += ch; }
    else if (ch === "}" || ch === "]" || ch === ")") { depth--; current += ch; }
    else if (depth === 0 && str.slice(i, i + delimiter.length) === delimiter) { parts.push(current); current = ""; i += delimiter.length - 1; }
    else { current += ch; }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function findTopLevelColon(str: string): number {
  let depth = 0, inString: string | null = null, escape = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (inString) { if (ch === inString) inString = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    else if (ch === "}" || ch === "]" || ch === ")") depth--;
    else if (ch === ":" && depth === 0) return i;
  }
  return -1;
}

function parseValue(str: string): unknown {
  const t = str.trim();
  if (!t) return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  if (t === "undefined") return undefined;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return Number(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
  if (t.startsWith("[") && t.endsWith("]")) {
    const inner = t.slice(1, -1);
    if (!inner.trim()) return [];
    return splitTopLevel(inner, ",").map((item) => parseValue(item)).filter((item) => item !== undefined);
  }
  if (t.startsWith("{") && t.endsWith("}")) return parseObject(t);
  return t;
}

function parseObject(objStr: string): Record<string, unknown> {
  const inner = objStr.slice(1, -1).trim();
  if (!inner) return {};
  const result: Record<string, unknown> = {};
  const entries = splitTopLevel(inner, ",");
  for (const entry of entries) {
    const colonIdx = findTopLevelColon(entry);
    if (colonIdx === -1) continue;
    const key = entry.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, "");
    const val = entry.slice(colonIdx + 1).trim();
    result[key] = parseValue(val);
  }
  return result;
}

function internalParse(input: string): PrismaQueryAST | null {
  const trimmed = input.trim();
  const match = trimmed.match(/prisma\.(\w+)\.(\w+)\s*\(/);
  if (!match) return null;
  const model = match[1];
  const operation = match[2] as PrismaOperation;
  if (!VALID_OPERATIONS.has(operation)) return null;
  const openParen = trimmed.indexOf("(", match.index! + match[0].length - 1);
  if (openParen === -1) return { model, operation, args: {} };
  const rawArgs = extractCallArgs(trimmed, openParen);
  if (!rawArgs || rawArgs.trim() === "") return { model, operation, args: {} };
  try {
    const parsed = parseValue(rawArgs) as Record<string, unknown>;
    return { model, operation, args: parsed ?? {} };
  } catch (err) {
    return { model, operation, args: {} };
  }
}

function modelToTableName(model: string): string {
  const snake = model.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  if (snake.endsWith("ss") || snake.endsWith("x") || snake.endsWith("ch") || snake.endsWith("sh")) return `${snake}es`;
  if (snake.endsWith("s")) return snake;
  if (snake.endsWith("y") && !/[aeiou]y$/.test(snake)) return `${snake.slice(0, -1)}ies`;
  return `${snake}s`;
}

function valueToSql(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
  if (Array.isArray(value)) return `(${value.map(valueToSql).join(", ")})`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function colToSql(col: string): string {
  return col.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

function generateWhere(where: Record<string, unknown>, indent: number = 2): string {
  const pad = " ".repeat(indent);
  const conditions: string[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (key === "AND" && Array.isArray(value)) {
      const inner = (value as Record<string, unknown>[]).map((w) => generateWhere(w, indent + 2));
      conditions.push(`(\n${inner.join(`\n${pad}AND\n`)}\n${pad})`);
    } else if (key === "OR" && Array.isArray(value)) {
      const inner = (value as Record<string, unknown>[]).map((w) => generateWhere(w, indent + 2));
      conditions.push(`(\n${inner.join(`\n${pad}OR\n`)}\n${pad})`);
    } else if (key === "NOT") {
      const items = Array.isArray(value) ? value : [value];
      const inner = items.map((w) => generateWhere(w as Record<string, unknown>, indent + 2));
      conditions.push(`NOT (\n${inner.join(`\n${pad}AND\n`)}\n${pad})`);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const ops = value as Record<string, unknown>;
      for (const [op, opVal] of Object.entries(ops)) {
        const sql = filterOpToSql(colToSql(key), op, opVal);
        if (sql) conditions.push(sql);
      }
    } else {
      conditions.push(`${colToSql(key)} = ${valueToSql(value)}`);
    }
  }
  return conditions.join(`\n${pad}AND `);
}

function filterOpToSql(col: string, op: string, value: unknown): string {
  switch (op) {
    case "equals": return `${col} = ${valueToSql(value)}`;
    case "not": return value === null ? `${col} IS NOT NULL` : `${col} != ${valueToSql(value)}`;
    case "in": return `${col} IN ${valueToSql(value)}`;
    case "notIn": return `${col} NOT IN ${valueToSql(value)}`;
    case "lt": return `${col} < ${valueToSql(value)}`;
    case "lte": return `${col} <= ${valueToSql(value)}`;
    case "gt": return `${col} > ${valueToSql(value)}`;
    case "gte": return `${col} >= ${valueToSql(value)}`;
    case "contains": return `${col} LIKE '%${String(value).replace(/'/g, "''")}%'`;
    case "startsWith": return `${col} LIKE '${String(value).replace(/'/g, "''")}%'`;
    case "endsWith": return `${col} LIKE '%${String(value).replace(/'/g, "''")}'`;
    case "mode": return "";
    default: return `${col} = ${valueToSql(value)}`;
  }
}

function generateOrderBy(orderBy: unknown): string {
  if (typeof orderBy === "string") return `ORDER BY ${colToSql(orderBy)}`;
  if (Array.isArray(orderBy)) {
    const parts = orderBy.map((o) => {
      if (typeof o === "string") return colToSql(o);
      return Object.entries(o as Record<string, unknown>).map(([col, dir]) => `${colToSql(col)} ${dir === "desc" ? "DESC" : "ASC"}`).join(", ");
    });
    return `ORDER BY ${parts.join(", ")}`;
  }
  if (typeof orderBy === "object" && orderBy !== null) {
    const parts = Object.entries(orderBy as Record<string, unknown>).map(([col, dir]) => `${colToSql(col)} ${dir === "desc" ? "DESC" : "ASC"}`);
    return `ORDER BY ${parts.join(", ")}`;
  }
  return "";
}

function generateIncludes(include: Record<string, unknown>, parentTable: string, parentModel: string): string[] {
  const joins: string[] = [];
  for (const [relName, relVal] of Object.entries(include)) {
    const relTable = modelToTableName(relName);
    const fkCol = `${colToSql(parentModel)}_id`;
    if (relVal === true) {
      joins.push(`LEFT JOIN ${relTable} ON ${relTable}.${fkCol} = ${parentTable}.id`);
    } else if (typeof relVal === "object" && relVal !== null) {
      const relArgs = relVal as Record<string, unknown>;
      if (relArgs.where || relArgs.orderBy || relArgs.take) {
        let subquery = `SELECT * FROM ${relTable} WHERE ${relTable}.${fkCol} = ${parentTable}.id`;
        if (relArgs.where) {
          const whereSql = generateWhere(relArgs.where as Record<string, unknown>);
          if (whereSql) subquery += ` AND ${whereSql}`;
        }
        if (relArgs.orderBy) subquery += ` ${generateOrderBy(relArgs.orderBy)}`;
        if (relArgs.take) subquery += ` LIMIT ${relArgs.take}`;
        joins.push(`LEFT JOIN LATERAL (${subquery}) AS ${relName} ON true`);
      } else {
        joins.push(`LEFT JOIN ${relTable} ON ${relTable}.${fkCol} = ${parentTable}.id`);
      }
    }
  }
  return joins;
}

function generateSelect(ast: PrismaQueryAST): string {
  const { args, model, operation } = ast;
  const table = modelToTableName(model);
  const parts: string[] = [`SELECT ${table}.*`, `FROM ${table}`];

  if (args.include && typeof args.include === "object") {
    const joins = generateIncludes(args.include as Record<string, unknown>, table, model);
    parts.push(...joins);
  }

  if (args.where && typeof args.where === "object") {
    const whereSql = generateWhere(args.where as Record<string, unknown>);
    if (whereSql) parts.push(`WHERE ${whereSql}`);
  }
  if (args.orderBy) { const orderSql = generateOrderBy(args.orderBy); if (orderSql) parts.push(orderSql); }
  if (operation === "findUnique") parts.push("LIMIT 1");
  else if (operation === "findFirst" && !args.take) parts.push("LIMIT 1");
  if (args.skip) parts.push(`OFFSET ${args.skip}`);
  if (args.take && operation !== "findUnique" && operation !== "findFirst") parts.push(`LIMIT ${args.take}`);
  return parts.join("\n") + ";";
}

function generateInsert(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const data = (args.data ?? {}) as Record<string, unknown>;
  const columns: string[] = [], values: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      for (const [nk, nv] of Object.entries(val as Record<string, unknown>)) {
        columns.push(`${colToSql(key)}_${colToSql(nk)}`);
        values.push(valueToSql(nv));
      }
    } else { columns.push(colToSql(key)); values.push(valueToSql(val)); }
  }
  return `INSERT INTO ${table}\n  (${columns.join(", ")})\nVALUES\n  (${values.join(", ")})\nRETURNING *;`;
}

function generateUpdate(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const data = (args.data ?? {}) as Record<string, unknown>;
  const sets: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      for (const [op, opVal] of Object.entries(val as Record<string, unknown>)) {
        if (op === "increment") sets.push(`${colToSql(key)} = ${colToSql(key)} + ${valueToSql(opVal)}`);
        else sets.push(`${colToSql(key)} = ${valueToSql(opVal)}`);
      }
    } else sets.push(`${colToSql(key)} = ${valueToSql(val)}`);
  }
  const parts: string[] = [`UPDATE ${table}`, `SET ${sets.join(",\n    ")}`];
  if (args.where && typeof args.where === "object") { const w = generateWhere(args.where as Record<string, unknown>); if (w) parts.push(`WHERE ${w}`); }
  parts.push("RETURNING *;");
  return parts.join("\n");
}

function generateDelete(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const parts: string[] = [`DELETE FROM ${table}`];
  if (args.where && typeof args.where === "object") { const w = generateWhere(args.where as Record<string, unknown>); if (w) parts.push(`WHERE ${w}`); }
  parts.push("RETURNING *;");
  return parts.join("\n");
}

function generateUpsert(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const data = (args.create ?? args.data ?? {}) as Record<string, unknown>;
  const updateData = (args.update ?? {}) as Record<string, unknown>;
  const columns: string[] = [], values: string[] = [], updates: string[] = [];
  for (const [key, val] of Object.entries(data)) { columns.push(colToSql(key)); values.push(valueToSql(val)); }
  for (const [key, val] of Object.entries(updateData)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      for (const [op, opVal] of Object.entries(val as Record<string, unknown>)) {
        if (op === "increment") updates.push(`${colToSql(key)} = ${colToSql(key)} + ${valueToSql(opVal)}`);
        else updates.push(`${colToSql(key)} = ${valueToSql(opVal)}`);
      }
    } else updates.push(`${colToSql(key)} = ${valueToSql(val)}`);
  }
  const conflictCols = args.where ? Object.keys(args.where as Record<string, unknown>).map(colToSql) : ["id"];
  return `INSERT INTO ${table}\n  (${columns.join(", ")})\nVALUES\n  (${values.join(", ")})\nON CONFLICT (${conflictCols.join(", ")})\nDO UPDATE SET\n  ${updates.join(",\n  ")}\nRETURNING *;`;
}

function generateCount(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const parts: string[] = ["SELECT COUNT(*) AS count", `FROM ${table}`];
  if (args.where && typeof args.where === "object") { const w = generateWhere(args.where as Record<string, unknown>); if (w) parts.push(`WHERE ${w}`); }
  return parts.join("\n") + ";";
}

function generateGroupBy(ast: PrismaQueryAST): string {
  const { args, model } = ast;
  const table = modelToTableName(model);
  const by = Array.isArray(args.by) ? (args.by as string[]).map(colToSql) : [colToSql(args.by as string)];
  let select = `SELECT ${by.join(", ")}`;
  if (args._count) { for (const [key, val] of Object.entries(args._count as Record<string, unknown>)) { if (val === true) select += `,\n  COUNT(${colToSql(key)}) AS ${colToSql(key)}_count`; } }
  const parts: string[] = [select, `FROM ${table}`];
  if (args.where && typeof args.where === "object") { const w = generateWhere(args.where as Record<string, unknown>); if (w) parts.push(`WHERE ${w}`); }
  parts.push(`GROUP BY ${by.join(", ")}`);
  if (args.orderBy) { const o = generateOrderBy(args.orderBy); if (o) parts.push(o); }
  if (args.take) parts.push(`LIMIT ${args.take}`);
  if (args.skip) parts.push(`OFFSET ${args.skip}`);
  return parts.join("\n") + ";";
}

export function prismaToSql(input: string): string {
  const ast = internalParse(input);
  if (!ast) return "-- Invalid Prisma query";
  switch (ast.operation) {
    case "findMany": case "findFirst": case "findUnique": return generateSelect(ast);
    case "create": return generateInsert(ast);
    case "update": return generateUpdate(ast);
    case "delete": return generateDelete(ast);
    case "upsert": return generateUpsert(ast);
    case "count": return generateCount(ast);
    case "groupBy": return generateGroupBy(ast);
    default: return `-- Unsupported: ${ast.operation}`;
  }
}
