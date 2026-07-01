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

export function parsePrismaQuery(input: string): PrismaQueryAST | null {
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
  } catch {
    return { model, operation, args: {} };
  }
}
