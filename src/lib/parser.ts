import {
  AstNode,
  DbDialect,
  QuerySchema,
  ModelDefinition,
  IndexSuggestion,
} from "../types";

// ==========================================
// 1. JS / Prisma Object Literal Tokenizer & Parser
// ==========================================

export type TokenType =
  | "brace-open"
  | "brace-close"
  | "bracket-open"
  | "bracket-close"
  | "colon"
  | "comma"
  | "dot"
  | "paren-open"
  | "paren-close"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "identifier";

export interface Token {
  type: TokenType;
  value: any;
  line: number;
  col: number;
}

export function tokenizeJs(str: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;

  while (i < str.length) {
    const char = str[i];

    // Handle newlines
    if (char === "\n") {
      line++;
      col = 1;
      i++;
      continue;
    }

    // Skip generic whitespace
    if (/\s/.test(char)) {
      col++;
      i++;
      continue;
    }

    // Handle single line comments
    if (char === "/" && str[i + 1] === "/") {
      i += 2;
      while (i < str.length && str[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Handle multi-line comments
    if (char === "/" && str[i + 1] === "*") {
      i += 2;
      while (i < str.length && !(str[i] === "*" && str[i + 1] === "/")) {
        if (str[i] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        i++;
      }
      i += 2;
      continue;
    }

    // Symbols
    if (char === "{") {
      tokens.push({ type: "brace-open", value: "{", line, col });
      col++;
      i++;
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "brace-close", value: "}", line, col });
      col++;
      i++;
      continue;
    }
    if (char === "[") {
      tokens.push({ type: "bracket-open", value: "[", line, col });
      col++;
      i++;
      continue;
    }
    if (char === "]") {
      tokens.push({ type: "bracket-close", value: "]", line, col });
      col++;
      i++;
      continue;
    }
    if (char === "(") {
      tokens.push({ type: "paren-open", value: "(", line, col });
      col++;
      i++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "paren-close", value: ")", line, col });
      col++;
      i++;
      continue;
    }
    if (char === ":") {
      tokens.push({ type: "colon", value: ":", line, col });
      col++;
      i++;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma", value: ",", line, col });
      col++;
      i++;
      continue;
    }
    if (char === ".") {
      tokens.push({ type: "dot", value: ".", line, col });
      col++;
      i++;
      continue;
    }

    // Strings (supporting single, double quotes, and backticks)
    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      let val = "";
      const startCol = col;
      i++;
      col++;
      while (i < str.length && str[i] !== quote) {
        if (str[i] === "\\") {
          i++;
          col++;
          val += str[i];
        } else {
          if (str[i] === "\n") {
            line++;
            col = 1;
          } else {
            col++;
          }
          val += str[i];
        }
        i++;
      }
      i++;
      col++; // skip closing quote
      tokens.push({ type: "string", value: val, line, col: startCol });
      continue;
    }

    // Numbers
    if (/[0-9.-]/.test(char)) {
      let numStr = "";
      const startCol = col;
      // Basic check to avoid mixing up leading minus with operations, but for query arguments it's mostly values
      while (i < str.length && /[0-9.eE+-]/.test(str[i])) {
        numStr += str[i];
        i++;
        col++;
      }
      const num = Number(numStr);
      tokens.push({
        type: "number",
        value: isNaN(num) ? 0 : num,
        line,
        col: startCol,
      });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let idStr = "";
      const startCol = col;
      while (i < str.length && /[a-zA-Z0-9_$]/.test(str[i])) {
        idStr += str[i];
        i++;
        col++;
      }

      if (idStr === "true") {
        tokens.push({ type: "boolean", value: true, line, col: startCol });
      } else if (idStr === "false") {
        tokens.push({ type: "boolean", value: false, line, col: startCol });
      } else if (idStr === "null") {
        tokens.push({ type: "null", value: null, line, col: startCol });
      } else {
        tokens.push({ type: "identifier", value: idStr, line, col: startCol });
      }
      continue;
    }

    // Unidentified characters (skip and log warning)
    i++;
    col++;
  }
  return tokens;
}

export function parseJsTokens(tokens: Token[]): any {
  let index = 0;

  function parseValue(): any {
    const token = tokens[index];
    if (!token) return undefined;

    if (
      token.type === "string" ||
      token.type === "number" ||
      token.type === "boolean"
    ) {
      index++;
      return token.value;
    }
    if (token.type === "null") {
      index++;
      return null;
    }
    if (token.type === "identifier") {
      index++;
      return token.value; // Represent variable names as strings
    }
    if (token.type === "brace-open") {
      return parseObject();
    }
    if (token.type === "bracket-open") {
      return parseArray();
    }
    throw new Error(
      `Unexpected token '${token.value}' of type '${token.type}' at line ${token.line}, col ${token.col}`,
    );
  }

  function parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    index++; // skip '{'

    while (index < tokens.length) {
      let token = tokens[index];
      if (token.type === "brace-close") {
        index++; // skip '}'
        return obj;
      }

      // Expect key (identifier or string)
      if (token.type !== "identifier" && token.type !== "string") {
        throw new Error(
          `Expected key identifier or string at line ${token.line}, col ${token.col}, got '${token.value}'`,
        );
      }
      const key = token.value;
      index++;

      // Expect colon ':'
      token = tokens[index];
      if (!token || token.type !== "colon") {
        throw new Error(
          `Expected ':' after key '${key}' at line ${token ? token.line : "EOF"}, col ${token ? token.col : ""}`,
        );
      }
      index++; // skip ':'

      const val = parseValue();
      obj[key] = val;

      token = tokens[index];
      if (token && token.type === "comma") {
        index++;
      }
    }
    return obj;
  }

  function parseArray(): any[] {
    const arr: any[] = [];
    index++; // skip '['

    while (index < tokens.length) {
      let token = tokens[index];
      if (token.type === "bracket-close") {
        index++; // skip ']'
        return arr;
      }

      const val = parseValue();
      arr.push(val);

      token = tokens[index];
      if (token && token.type === "comma") {
        index++;
      }
    }
    return arr;
  }

  // Skip any preceding wrapper expression like `prisma.user.findMany(...)`
  // and jump to the inner object literal `{ ... }`
  let foundBrace = -1;
  for (let t = 0; t < tokens.length; t++) {
    if (tokens[t].type === "brace-open") {
      foundBrace = t;
      break;
    }
  }

  if (foundBrace !== -1) {
    index = foundBrace;
    return parseValue();
  }

  throw new Error(
    'Could not find starting curly brace "{". Please provide a valid Javascript object or a prisma query call.',
  );
}

// Extract base model name from a string like `prisma.post.findMany({...})`
export function extractBaseModel(code: string): string {
  const match = code.match(/prisma\.([a-zA-Z0-9_$]+)\./);
  if (match && match[1]) {
    return match[1];
  }
  return "user"; // Default fallback
}

// Extract operation name from a string like `prisma.post.findMany({...})`
export function extractOperation(code: string): string {
  const match = code.match(/prisma\.[a-zA-Z0-9_$]+\.([a-zA-Z0-9_$]+)\(/);
  if (match && match[1]) {
    return match[1];
  }
  return "findMany"; // Default fallback
}

// ==========================================
// 2. Prisma to SQL Translator
// ==========================================

export function translatePrismaToSql(
  code: string,
  dialect: DbDialect,
  schema?: QuerySchema,
): { sql: string; ast: AstNode; baseModel: string } {
  const baseModel = extractBaseModel(code);
  const operation = extractOperation(code);
  const tokens = tokenizeJs(code);
  const prismaArgs = parseJsTokens(tokens);

  // Helper to format identifiers according to SQL Dialect
  function quoteId(id: string): string {
    if (dialect === "mysql") {
      return `\`${id}\``;
    }
    return `"${id}"`;
  }

  // Schema resolver: find model by name (case-insensitive)
  function findModel(name: string): ModelDefinition | undefined {
    if (!schema || !schema.models) return undefined;
    return schema.models.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
  }

  function formatValue(v: any): string {
    if (typeof v === "string") {
      return `'${v.replace(/'/g, "''")}'`;
    }
    if (v === null) return "NULL";
    return String(v);
  }

  function compileSimpleWhere(
    whereObj: Record<string, any>,
    modelName: string,
  ): string {
    if (!whereObj || Object.keys(whereObj).length === 0) return "";
    const modelDef = findModel(modelName);
    const conditions: string[] = [];

    Object.keys(whereObj).forEach((key) => {
      const val = whereObj[key];

      if (key === "AND") {
        if (Array.isArray(val)) {
          const inner = val
            .map((sub) => compileSimpleWhere(sub, modelName))
            .filter(Boolean);
          if (inner.length > 0) conditions.push(`(${inner.join(" AND ")})`);
        } else {
          const inner = compileSimpleWhere(val, modelName);
          if (inner) conditions.push(inner);
        }
        return;
      }

      if (key === "OR") {
        if (Array.isArray(val)) {
          const inner = val
            .map((sub) => compileSimpleWhere(sub, modelName))
            .filter(Boolean);
          if (inner.length > 0) conditions.push(`(${inner.join(" OR ")})`);
        }
        return;
      }

      if (key === "NOT") {
        const inner = compileSimpleWhere(val, modelName);
        if (inner) conditions.push(`NOT (${inner})`);
        return;
      }

      const fieldDef = modelDef?.fields.find((f) => f.name === key);
      if (fieldDef?.isRelation) {
        return;
      }

      const dbColName = fieldDef?.dbName || key;
      const col = quoteId(dbColName);

      if (val === null) {
        conditions.push(`${col} IS NULL`);
      } else if (typeof val === "object" && !Array.isArray(val)) {
        Object.keys(val).forEach((op) => {
          const opVal = val[op];
          if (op === "equals") {
            if (opVal === null) conditions.push(`${col} IS NULL`);
            else conditions.push(`${col} = ${formatValue(opVal)}`);
          } else if (op === "not") {
            if (opVal === null) conditions.push(`${col} IS NOT NULL`);
            else conditions.push(`${col} != ${formatValue(opVal)}`);
          } else if (op === "in") {
            const list = (opVal as any[]).map(formatValue).join(", ");
            conditions.push(`${col} IN (${list})`);
          } else if (op === "notIn") {
            const list = (opVal as any[]).map(formatValue).join(", ");
            conditions.push(`${col} NOT IN (${list})`);
          } else if (op === "lt") {
            conditions.push(`${col} < ${formatValue(opVal)}`);
          } else if (op === "lte") {
            conditions.push(`${col} <= ${formatValue(opVal)}`);
          } else if (op === "gt") {
            conditions.push(`${col} > ${formatValue(opVal)}`);
          } else if (op === "gte") {
            conditions.push(`${col} >= ${formatValue(opVal)}`);
          } else if (op === "contains") {
            conditions.push(`${col} LIKE '%${opVal}%'`);
          } else if (op === "startsWith") {
            conditions.push(`${col} LIKE '${opVal}%'`);
          } else if (op === "endsWith") {
            conditions.push(`${col} LIKE '%${opVal}'`);
          }
        });
      } else {
        conditions.push(`${col} = ${formatValue(val)}`);
      }
    });

    return conditions.join(" AND ");
  }

  function compileCreate(
    dataObj: Record<string, any>,
    modelName: string,
  ): string {
    const modelDef = findModel(modelName);
    const tableName = modelDef?.dbName || capitalize(modelName);
    const cols: string[] = [];
    const vals: string[] = [];

    Object.keys(dataObj).forEach((key) => {
      const val = dataObj[key];
      const fieldDef = modelDef?.fields.find((f) => f.name === key);
      if (fieldDef?.isRelation) return;

      const dbColName = fieldDef?.dbName || key;
      cols.push(quoteId(dbColName));
      vals.push(formatValue(val));
    });

    return `INSERT INTO ${quoteId(tableName)} (${cols.join(", ")})\nVALUES (${vals.join(", ")});`;
  }

  function compileCreateMany(dataArr: any[], modelName: string): string {
    const modelDef = findModel(modelName);
    const tableName = modelDef?.dbName || capitalize(modelName);

    if (!Array.isArray(dataArr) || dataArr.length === 0) {
      return `-- No data provided for createMany`;
    }

    const allKeysSet = new Set<string>();
    dataArr.forEach((obj) => {
      if (obj && typeof obj === "object") {
        Object.keys(obj).forEach((k) => {
          const fieldDef = modelDef?.fields.find((f) => f.name === k);
          if (!fieldDef?.isRelation) {
            allKeysSet.add(k);
          }
        });
      }
    });

    const keys = Array.from(allKeysSet);
    const cols = keys.map((k) => {
      const fieldDef = modelDef?.fields.find((f) => f.name === k);
      return quoteId(fieldDef?.dbName || k);
    });

    const valRows = dataArr.map((obj) => {
      const rowVals = keys.map((k) => {
        const val = obj[k];
        return val === undefined ? "DEFAULT" : formatValue(val);
      });
      return `(${rowVals.join(", ")})`;
    });

    return `INSERT INTO ${quoteId(tableName)} (${cols.join(", ")})\nVALUES\n  ${valRows.join(",\n  ")};`;
  }

  function compileUpdate(
    whereObj: Record<string, any>,
    dataObj: Record<string, any>,
    modelName: string,
  ): string {
    const modelDef = findModel(modelName);
    const tableName = modelDef?.dbName || capitalize(modelName);

    const sets: string[] = [];
    Object.keys(dataObj).forEach((key) => {
      const val = dataObj[key];
      const fieldDef = modelDef?.fields.find((f) => f.name === key);
      if (fieldDef?.isRelation) return;

      const dbColName = fieldDef?.dbName || key;
      sets.push(`${quoteId(dbColName)} = ${formatValue(val)}`);
    });

    const whereClause = compileSimpleWhere(whereObj, modelName);
    let sql = `UPDATE ${quoteId(tableName)}\nSET\n  ${sets.join(",\n  ")}`;
    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }
    sql += ";";
    return sql;
  }

  function compileDelete(
    whereObj: Record<string, any>,
    modelName: string,
  ): string {
    const modelDef = findModel(modelName);
    const tableName = modelDef?.dbName || capitalize(modelName);
    const whereClause = compileSimpleWhere(whereObj, modelName);

    let sql = `DELETE FROM ${quoteId(tableName)}`;
    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }
    sql += ";";
    return sql;
  }

  function compileUpsert(
    whereObj: Record<string, any>,
    updateObj: Record<string, any>,
    createObj: Record<string, any>,
    modelName: string,
  ): string {
    const modelDef = findModel(modelName);
    const tableName = modelDef?.dbName || capitalize(modelName);

    const cols: string[] = [];
    const vals: string[] = [];
    Object.keys(createObj).forEach((k) => {
      const fieldDef = modelDef?.fields.find((f) => f.name === k);
      if (!fieldDef?.isRelation) {
        cols.push(quoteId(fieldDef?.dbName || k));
        vals.push(formatValue(createObj[k]));
      }
    });

    const sets = Object.keys(updateObj).map((k) => {
      const fieldDef = modelDef?.fields.find((f) => f.name === k);
      const dbCol = fieldDef?.dbName || k;
      return `${quoteId(dbCol)} = ${formatValue(updateObj[k])}`;
    });

    const conflictCols = Object.keys(whereObj).map((k) => {
      const fieldDef = modelDef?.fields.find((f) => f.name === k);
      return quoteId(fieldDef?.dbName || k);
    });

    if (dialect === "mysql") {
      return `INSERT INTO ${quoteId(tableName)} (${cols.join(", ")})\nVALUES (${vals.join(", ")})\nON DUPLICATE KEY UPDATE ${sets.join(", ")};`;
    }

    return `INSERT INTO ${quoteId(tableName)} (${cols.join(", ")})\nVALUES (${vals.join(", ")})\nON CONFLICT (${conflictCols.join(", ")})\nDO UPDATE SET ${sets.join(", ")};`;
  }

  const rootModelDef = findModel(baseModel);
  const rootTableName = rootModelDef?.dbName || capitalize(baseModel);

  // ROUTE MUTATION CALLS EARLY
  if (operation === "create") {
    const dataObj = prismaArgs.data || prismaArgs;
    const sql = compileCreate(dataObj, baseModel);
    const ast: AstNode = {
      type: "PrismaInsert",
      name: baseModel,
      properties: { operation: "create", table: rootTableName },
      children: [
        {
          type: "InsertData",
          value: JSON.stringify(dataObj),
        },
      ],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "createMany") {
    const dataArr = prismaArgs.data || [];
    const sql = compileCreateMany(dataArr, baseModel);
    const ast: AstNode = {
      type: "PrismaInsertMany",
      name: baseModel,
      properties: { operation: "createMany", table: rootTableName },
      children: [
        {
          type: "InsertData",
          value: JSON.stringify(dataArr),
        },
      ],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "update") {
    const dataObj = prismaArgs.data || {};
    const whereObj = prismaArgs.where || {};
    const sql = compileUpdate(whereObj, dataObj, baseModel);
    const ast: AstNode = {
      type: "PrismaUpdate",
      name: baseModel,
      properties: { operation: "update", table: rootTableName },
      children: [
        { type: "UpdateSet", value: JSON.stringify(dataObj) },
        { type: "UpdateWhere", value: JSON.stringify(whereObj) },
      ],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "updateMany") {
    const dataObj = prismaArgs.data || {};
    const whereObj = prismaArgs.where || {};
    const sql = compileUpdate(whereObj, dataObj, baseModel);
    const ast: AstNode = {
      type: "PrismaUpdateMany",
      name: baseModel,
      properties: { operation: "updateMany", table: rootTableName },
      children: [
        { type: "UpdateSet", value: JSON.stringify(dataObj) },
        { type: "UpdateWhere", value: JSON.stringify(whereObj) },
      ],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "delete") {
    const whereObj = prismaArgs.where || {};
    const sql = compileDelete(whereObj, baseModel);
    const ast: AstNode = {
      type: "PrismaDelete",
      name: baseModel,
      properties: { operation: "delete", table: rootTableName },
      children: [{ type: "DeleteWhere", value: JSON.stringify(whereObj) }],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "deleteMany") {
    const whereObj = prismaArgs.where || {};
    const sql = compileDelete(whereObj, baseModel);
    const ast: AstNode = {
      type: "PrismaDeleteMany",
      name: baseModel,
      properties: { operation: "deleteMany", table: rootTableName },
      children: [{ type: "DeleteWhere", value: JSON.stringify(whereObj) }],
    };
    return { sql, ast, baseModel };
  }

  if (operation === "upsert") {
    const whereObj = prismaArgs.where || {};
    const updateObj = prismaArgs.update || {};
    const createObj = prismaArgs.create || {};
    const sql = compileUpsert(whereObj, updateObj, createObj, baseModel);
    const ast: AstNode = {
      type: "PrismaUpsert",
      name: baseModel,
      properties: { operation: "upsert", table: rootTableName },
      children: [
        { type: "UpsertWhere", value: JSON.stringify(whereObj) },
        { type: "UpsertUpdate", value: JSON.stringify(updateObj) },
        { type: "UpsertCreate", value: JSON.stringify(createObj) },
      ],
    };
    return { sql, ast, baseModel };
  }

  // We accumulate columns, joins, and alias information during a recursive pass of select/include
  interface ColumnSelection {
    sqlName: string;
    aliasName?: string;
  }

  interface JoinSelection {
    joinType: "LEFT" | "INNER";
    tableName: string;
    tableAlias: string;
    onClause: string;
  }

  const columns: ColumnSelection[] = [];
  const joins: JoinSelection[] = [];
  const relationPaths: string[] = []; // To avoid duplicate joins

  // Recursive visitor to compile columns and nested joins
  function visitSelectInclude(
    currentModelName: string,
    tableAlias: string,
    selectObj: Record<string, any>,
    includeObj?: Record<string, any>,
    path: string[] = [],
  ) {
    const modelDef = findModel(currentModelName);

    // If neither select nor include is defined, fetch all primitive fields from schema (or fallback to *)
    const hasSelect = selectObj && Object.keys(selectObj).length > 0;
    const hasInclude = includeObj && Object.keys(includeObj).length > 0;

    if (!hasSelect) {
      if (modelDef) {
        // Select all standard fields of the model (not relation fields)
        modelDef.fields.forEach((field) => {
          if (!field.isRelation) {
            const dbColName = field.dbName || field.name;
            const fullColName = `${quoteId(tableAlias)}.${quoteId(dbColName)}`;
            const outAlias =
              path.length > 0 ? `${path.join("_")}_${field.name}` : undefined;
            columns.push({ sqlName: fullColName, aliasName: outAlias });
          }
        });
      } else {
        // Fallback to select *
        columns.push({ sqlName: `${quoteId(tableAlias)}.*` });
      }
    } else {
      // Process explicit select keys
      Object.keys(selectObj).forEach((key) => {
        const val = selectObj[key];
        const fieldDef = modelDef?.fields.find((f) => f.name === key);

        if (val === true || typeof val !== "object") {
          // This is a plain field
          const dbColName = fieldDef?.dbName || key;
          const fullColName = `${quoteId(tableAlias)}.${quoteId(dbColName)}`;
          const outAlias =
            path.length > 0 ? `${path.join("_")}_${key}` : undefined;
          columns.push({ sqlName: fullColName, aliasName: outAlias });
        } else {
          // It's a relation/nested object (e.g., posts: { select: { ... } })
          handleRelation(
            key,
            val,
            fieldDef,
            tableAlias,
            currentModelName,
            path,
          );
        }
      });
    }

    // Process include keys
    if (hasInclude) {
      // With 'include', we also select all standard fields of the current model
      if (modelDef && !hasSelect) {
        // Already handled above if no select object exists
      } else if (modelDef) {
        modelDef.fields.forEach((field) => {
          if (!field.isRelation) {
            const dbColName = field.dbName || field.name;
            const fullColName = `${quoteId(tableAlias)}.${quoteId(dbColName)}`;
            const outAlias =
              path.length > 0 ? `${path.join("_")}_${field.name}` : undefined;
            // Avoid duplicate additions
            if (!columns.some((c) => c.sqlName === fullColName)) {
              columns.push({ sqlName: fullColName, aliasName: outAlias });
            }
          }
        });
      }

      Object.keys(includeObj || {}).forEach((key) => {
        const val = includeObj[key];
        const fieldDef = modelDef?.fields.find((f) => f.name === key);
        handleRelation(key, val, fieldDef, tableAlias, currentModelName, path);
      });
    }
  }

  function handleRelation(
    relationKey: string,
    nestedObj: any,
    fieldDef: any,
    parentAlias: string,
    parentModelName: string,
    path: string[],
  ) {
    // Determine related model
    const relatedModelName =
      fieldDef?.relationModel || singularize(relationKey);
    const relatedModelDef = findModel(relatedModelName);
    const relatedTableName =
      relatedModelDef?.dbName || capitalize(relatedModelName);

    // Create unique alias for this join path (e.g., "posts", "posts_comments")
    const newPath = [...path, relationKey];
    const relationAlias = newPath.join("_");

    // Build join ON condition using schema relation fields or standard heuristic fallbacks
    let onClause = "";
    if (
      fieldDef?.relationFields &&
      fieldDef?.relationReferences &&
      fieldDef.relationFields.length > 0
    ) {
      // The relation is declared on the parent side
      const pFields = fieldDef.relationFields; // e.g. ["authorId"]
      const rRefs = fieldDef.relationReferences; // e.g. ["id"]
      const conditions = pFields.map((pf: string, idx: number) => {
        const parentCol = parentAlias;
        const parentFieldDef = findModel(parentModelName)?.fields.find(
          (f) => f.name === pf,
        );
        const parentDbCol = parentFieldDef?.dbName || pf;

        const childFieldDef = relatedModelDef?.fields.find(
          (f) => f.name === rRefs[idx],
        );
        const childDbCol = childFieldDef?.dbName || rRefs[idx];

        return `${quoteId(parentCol)}.${quoteId(parentDbCol)} = ${quoteId(relationAlias)}.${quoteId(childDbCol)}`;
      });
      onClause = conditions.join(" AND ");
    } else {
      // Check if child has a relation field pointing back to parent
      const childRelationField = relatedModelDef?.fields.find(
        (f) =>
          f.isRelation &&
          f.relationModel?.toLowerCase() === parentModelName.toLowerCase(),
      );

      if (
        childRelationField?.relationFields &&
        childRelationField?.relationReferences
      ) {
        // Child specifies relation, e.g. Post has authorId referencing User.id
        const childFields = childRelationField.relationFields;
        const parentRefs = childRelationField.relationReferences;
        const conditions = childFields.map((cf: string, idx: number) => {
          const parentCol = parentAlias;
          const parentFieldDef = findModel(parentModelName)?.fields.find(
            (f) => f.name === parentRefs[idx],
          );
          const parentDbCol = parentFieldDef?.dbName || parentRefs[idx];

          const childFieldDef = relatedModelDef?.fields.find(
            (f) => f.name === cf,
          );
          const childDbCol = childFieldDef?.dbName || cf;

          return `${quoteId(parentCol)}.${quoteId(parentDbCol)} = ${quoteId(relationAlias)}.${quoteId(childDbCol)}`;
        });
        onClause = conditions.join(" AND ");
      } else {
        // Heuristic fallback
        // If related key is a singular (belongsTo), join Parent.relationId = Relation.id
        // If plural (hasMany), join Parent.id = Relation.parentId
        const isPlural = relationKey.endsWith("s");
        if (isPlural) {
          const parentIdCol = "id";
          const childRefCol = `${camelCase(parentAlias)}Id`;
          onClause = `${quoteId(parentAlias)}.${quoteId(parentIdCol)} = ${quoteId(relationAlias)}.${quoteId(childRefCol)}`;
        } else {
          const parentRefCol = `${camelCase(relationKey)}Id`;
          const childIdCol = "id";
          onClause = `${quoteId(parentAlias)}.${quoteId(parentRefCol)} = ${quoteId(relationAlias)}.${quoteId(childIdCol)}`;
        }
      }
    }

    // Add join if not already registered
    const joinPathKey = newPath.join("/");
    if (!relationPaths.includes(joinPathKey)) {
      relationPaths.push(joinPathKey);
      joins.push({
        joinType: "LEFT",
        tableName: relatedTableName,
        tableAlias: relationAlias,
        onClause,
      });
    }

    // Recursively parse deeper selects or includes
    const nestedSelect = nestedObj?.select || {};
    const nestedInclude = nestedObj?.include || {};
    visitSelectInclude(
      relatedModelName,
      relationAlias,
      nestedSelect,
      nestedInclude,
      newPath,
    );
  }

  // Compile base selection
  const selectObj = prismaArgs.select || {};
  const includeObj = prismaArgs.include || {};
  visitSelectInclude(baseModel, baseModel, selectObj, includeObj);

  // ==========================================
  // WHERE Filter Compilation
  // ==========================================

  function compileWhere(
    whereObj: Record<string, any>,
    currentAlias: string,
    currentModelName: string,
  ): string {
    if (!whereObj || Object.keys(whereObj).length === 0) return "";

    const conditions: string[] = [];

    Object.keys(whereObj).forEach((key) => {
      const val = whereObj[key];

      // Logical operators
      if (key === "AND") {
        if (Array.isArray(val)) {
          const inner = val
            .map((sub) => compileWhere(sub, currentAlias, currentModelName))
            .filter(Boolean);
          if (inner.length > 0) conditions.push(`(${inner.join(" AND ")})`);
        } else {
          const inner = compileWhere(val, currentAlias, currentModelName);
          if (inner) conditions.push(inner);
        }
        return;
      }

      if (key === "OR") {
        if (Array.isArray(val)) {
          const inner = val
            .map((sub) => compileWhere(sub, currentAlias, currentModelName))
            .filter(Boolean);
          if (inner.length > 0) conditions.push(`(${inner.join(" OR ")})`);
        }
        return;
      }

      if (key === "NOT") {
        const inner = compileWhere(val, currentAlias, currentModelName);
        if (inner) conditions.push(`NOT (${inner})`);
        return;
      }

      // Check if it is a field of the current model
      const modelDef = findModel(currentModelName);
      const fieldDef = modelDef?.fields.find((f) => f.name === key);

      if (fieldDef?.isRelation) {
        // Nested relation condition (e.g. posts: { some: { published: true } })
        const relatedModelName = fieldDef.relationModel || singularize(key);
        const relatedModelDef = findModel(relatedModelName);
        const relatedTableName =
          relatedModelDef?.dbName || capitalize(relatedModelName);

        const opKeys = Object.keys(val);
        const relationOp = opKeys[0]; // some, every, none
        const subFilter = val[relationOp];

        // Determine link keys
        let parentKey = "id";
        let childForeignKey = `${camelCase(currentModelName)}Id`;

        if (fieldDef.relationFields && fieldDef.relationFields.length > 0) {
          parentKey = fieldDef.relationFields[0];
          childForeignKey = fieldDef.relationReferences?.[0] || childForeignKey;
        } else {
          const backRel = relatedModelDef?.fields.find(
            (f) =>
              f.isRelation &&
              f.relationModel?.toLowerCase() === currentModelName.toLowerCase(),
          );
          if (backRel?.relationFields && backRel.relationFields.length > 0) {
            parentKey = backRel.relationReferences?.[0] || "id";
            childForeignKey = backRel.relationFields[0];
          }
        }

        // Map logical field names to physical DB column names
        const parentModelDef = findModel(currentModelName);
        const parentFieldDef = parentModelDef?.fields.find(
          (f) => f.name === parentKey,
        );
        const parentDbCol = parentFieldDef?.dbName || parentKey;

        const childModelDef = findModel(relatedModelName);
        const childFieldDef = childModelDef?.fields.find(
          (f) => f.name === childForeignKey,
        );
        const childDbCol = childFieldDef?.dbName || childForeignKey;

        // We translate relation condition using EXISTS subqueries
        const subAlias = `sub_${key}`;
        const subWhere = compileWhere(subFilter, subAlias, relatedModelName);
        const linkCondition = `${quoteId(currentAlias)}.${quoteId(parentDbCol)} = ${quoteId(subAlias)}.${quoteId(childDbCol)}`;
        const finalSubWhere =
          subWhere ? `${linkCondition} AND ${subWhere}` : linkCondition;

        if (relationOp === "some") {
          conditions.push(
            `EXISTS (SELECT 1 FROM ${quoteId(relatedTableName)} AS ${quoteId(subAlias)} WHERE ${finalSubWhere})`,
          );
        } else if (relationOp === "none") {
          conditions.push(
            `NOT EXISTS (SELECT 1 FROM ${quoteId(relatedTableName)} AS ${quoteId(subAlias)} WHERE ${finalSubWhere})`,
          );
        } else if (relationOp === "every") {
          // every is equivalent to NOT EXISTS (child with NOT condition)
          const negSubWhere = compileWhere(
            { NOT: subFilter },
            subAlias,
            relatedModelName,
          );
          const everyWhere =
            negSubWhere ? `${linkCondition} AND ${negSubWhere}` : linkCondition;
          conditions.push(
            `NOT EXISTS (SELECT 1 FROM ${quoteId(relatedTableName)} AS ${quoteId(subAlias)} WHERE ${everyWhere})`,
          );
        }
        return;
      }

      // Standard field operation
      const dbColName = fieldDef?.dbName || key;
      const fullCol = `${quoteId(currentAlias)}.${quoteId(dbColName)}`;

      if (val === null) {
        conditions.push(`${fullCol} IS NULL`);
      } else if (typeof val === "object" && !Array.isArray(val)) {
        // Complex operators
        Object.keys(val).forEach((op) => {
          const opVal = val[op];
          if (op === "equals") {
            if (opVal === null) conditions.push(`${fullCol} IS NULL`);
            else conditions.push(`${fullCol} = ${formatValue(opVal)}`);
          } else if (op === "not") {
            if (opVal === null) conditions.push(`${fullCol} IS NOT NULL`);
            else conditions.push(`${fullCol} != ${formatValue(opVal)}`);
          } else if (op === "in") {
            const list = (opVal as any[]).map(formatValue).join(", ");
            conditions.push(`${fullCol} IN (${list})`);
          } else if (op === "notIn") {
            const list = (opVal as any[]).map(formatValue).join(", ");
            conditions.push(`${fullCol} NOT IN (${list})`);
          } else if (op === "lt") {
            conditions.push(`${fullCol} < ${formatValue(opVal)}`);
          } else if (op === "lte") {
            conditions.push(`${fullCol} <= ${formatValue(opVal)}`);
          } else if (op === "gt") {
            conditions.push(`${fullCol} > ${formatValue(opVal)}`);
          } else if (op === "gte") {
            conditions.push(`${fullCol} >= ${formatValue(opVal)}`);
          } else if (op === "contains") {
            conditions.push(`${fullCol} LIKE '%${opVal}%'`);
          } else if (op === "startsWith") {
            conditions.push(`${fullCol} LIKE '${opVal}%'`);
          } else if (op === "endsWith") {
            conditions.push(`${fullCol} LIKE '%${opVal}'`);
          }
        });
      } else {
        // Direct equality
        conditions.push(`${fullCol} = ${formatValue(val)}`);
      }
    });

    return conditions.join(" AND ");
  }

  const whereClause = compileWhere(
    prismaArgs.where || {},
    baseModel,
    baseModel,
  );

  // ==========================================
  // ORDER BY, LIMIT, OFFSET Compilation
  // ==========================================

  let orderBySql = "";
  if (prismaArgs.orderBy) {
    const orders: string[] = [];
    const compileOrder = (item: any) => {
      Object.keys(item).forEach((k) => {
        const direction = String(item[k]).toUpperCase();
        orders.push(`${quoteId(baseModel)}.${quoteId(k)} ${direction}`);
      });
    };

    if (Array.isArray(prismaArgs.orderBy)) {
      prismaArgs.orderBy.forEach(compileOrder);
    } else {
      compileOrder(prismaArgs.orderBy);
    }
    if (orders.length > 0) {
      orderBySql = `ORDER BY ${orders.join(", ")}`;
    }
  }

  let limitSql = "";
  if (typeof prismaArgs.take === "number") {
    limitSql = `LIMIT ${prismaArgs.take}`;
  }

  let offsetSql = "";
  if (typeof prismaArgs.skip === "number") {
    offsetSql = `OFFSET ${prismaArgs.skip}`;
  }

  // ==========================================
  // Assemble SQL Statement
  // ==========================================

  const selectCols = columns
    .map((col) =>
      col.aliasName ?
        `${col.sqlName} AS ${quoteId(col.aliasName)}`
      : col.sqlName,
    )
    .join(",\n  ");

  let sql = `SELECT\n  ${selectCols}\nFROM ${quoteId(rootTableName)} AS ${quoteId(baseModel)}`;

  if (joins.length > 0) {
    const joinLines = joins
      .map(
        (j) =>
          `${j.joinType} JOIN ${quoteId(j.tableName)} AS ${quoteId(j.tableAlias)} ON ${j.onClause}`,
      )
      .join("\n");
    sql += `\n${joinLines}`;
  }

  if (whereClause) {
    sql += `\nWHERE ${whereClause}`;
  }

  if (orderBySql) sql += `\n${orderBySql}`;
  if (limitSql) sql += `\n${limitSql}`;
  if (offsetSql) sql += `\n${offsetSql}`;

  sql += ";";

  // ==========================================
  // Build AST Node Tree for Prisma
  // ==========================================

  const ast: AstNode = {
    type: "PrismaQuery",
    name: baseModel,
    properties: {
      operation: "findMany",
      baseTable: rootTableName,
    },
    children: [
      {
        type: "SelectClause",
        children: columns.map((col) => ({
          type: "Column",
          name: col.aliasName || col.sqlName,
          value: col.sqlName,
        })),
      },
    ],
  };

  if (joins.length > 0) {
    ast.children?.push({
      type: "RelationsJoin",
      children: joins.map((j) => ({
        type: "Join",
        name: j.tableAlias,
        value: j.tableName,
        properties: { condition: j.onClause },
      })),
    });
  }

  if (whereClause) {
    ast.children?.push({
      type: "FilterClause",
      name: "where",
      value: whereClause,
    });
  }

  return { sql, ast, baseModel };
}

// ==========================================
// 3. SQL to Prisma Translator
// ==========================================

export function translateSqlToPrisma(
  sqlStr: string,
  dialect: DbDialect,
  schema?: QuerySchema,
): { prisma: string; ast: AstNode } {
  function findModel(name: string): ModelDefinition | undefined {
    if (!schema || !schema.models) return undefined;
    return schema.models.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
  }

  // Clean comments and normalize whitespace
  let cleanSql = sqlStr.replace(/--.*$/gm, "");
  cleanSql = cleanSql.replace(/\/\*[\s\S]*?\*\//g, "");
  cleanSql = cleanSql.trim().replace(/\s+/g, " ");

  const upperSql = cleanSql.toUpperCase();

  if (upperSql.startsWith("INSERT")) {
    const tblMatch = cleanSql.match(
      /INSERT\s+INTO\s+(\w+|"[^"]+"|`[^`]+`)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)(?:\s+(?:ON\s+CONFLICT|ON\s+DUPLICATE\s+KEY\s+UPDATE)[\s\S]*|$)/i,
    );
    if (!tblMatch) {
      throw new Error(
        "Could not parse INSERT statement. Please verify SQL syntax e.g. INSERT INTO table (col1, col2) VALUES (val1, val2);",
      );
    }
    const rawTableName = cleanQuotes(tblMatch[1]);
    const columnsStr = tblMatch[2];

    const valuesStartIndex = cleanSql.toUpperCase().indexOf(" VALUES ");
    if (valuesStartIndex === -1) {
      throw new Error("Could not find VALUES clause in INSERT statement.");
    }
    let valuesPart = cleanSql.slice(valuesStartIndex + 8).trim();

    let onConflictPart = "";
    const onConflictIndex = valuesPart
      .toUpperCase()
      .search(/\s+ON\s+CONFLICT/i);
    const onDuplicateIndex = valuesPart
      .toUpperCase()
      .search(/\s+ON\s+DUPLICATE/i);

    if (onConflictIndex !== -1) {
      onConflictPart = valuesPart.slice(onConflictIndex).trim();
      valuesPart = valuesPart.slice(0, onConflictIndex).trim();
    } else if (onDuplicateIndex !== -1) {
      onConflictPart = valuesPart.slice(onDuplicateIndex).trim();
      valuesPart = valuesPart.slice(0, onDuplicateIndex).trim();
    }

    if (valuesPart.endsWith(";")) {
      valuesPart = valuesPart.slice(0, -1).trim();
    }

    const rowMatches = [...valuesPart.matchAll(/\((.*?)\)/g)];
    const rows = rowMatches.map((m) =>
      m[1].split(",").map((s) => parseSqlValue(s.trim())),
    );
    const columns = columnsStr.split(",").map((s) => cleanQuotes(s.trim()));

    const schemaModel = schema?.models.find(
      (m) =>
        m.dbName === rawTableName ||
        m.name.toLowerCase() === rawTableName.toLowerCase(),
    );
    const baseModelName =
      schemaModel ? schemaModel.name : camelCase(singularize(rawTableName));
    const camelModelVar = camelCase(baseModelName);

    const isUpsert = onConflictPart !== "";

    if (isUpsert) {
      let updateSetStr = "";
      let conflictTargetStr = "";

      if (onConflictPart.toUpperCase().includes("ON CONFLICT")) {
        const m = onConflictPart.match(
          /ON\s+CONFLICT\s*(?:\((.*?)\))?\s*DO\s+UPDATE\s+SET\s+(.*)/i,
        );
        if (m) {
          conflictTargetStr = m[1] || "";
          updateSetStr = m[2];
        }
      } else if (onConflictPart.toUpperCase().includes("ON DUPLICATE")) {
        const m = onConflictPart.match(/ON\s+DUPLICATE\s+KEY\s+UPDATE\s+(.*)/i);
        if (m) {
          updateSetStr = m[1];
        }
      }

      if (updateSetStr.endsWith(";")) {
        updateSetStr = updateSetStr.slice(0, -1).trim();
      }

      const updateData: Record<string, any> = {};
      const sets = updateSetStr.split(",").map((s) => s.trim());
      sets.forEach((set) => {
        const parts = set.split(/\s*=\s*/);
        if (parts.length === 2) {
          const col = cleanQuotes(parts[0]);
          const val = parseSqlValue(parts[1].replace(/;$/, ""));
          const fieldDef = schemaModel?.fields.find(
            (f) => f.dbName === col || f.name === col,
          );
          const finalPrismaField = fieldDef ? fieldDef.name : col;
          updateData[finalPrismaField] = val;
        }
      });

      const createData: Record<string, any> = {};
      columns.forEach((col, idx) => {
        const fieldDef = schemaModel?.fields.find(
          (f) => f.dbName === col || f.name === col,
        );
        const finalPrismaField = fieldDef ? fieldDef.name : col;
        createData[finalPrismaField] = rows[0] ? rows[0][idx] : undefined;
      });

      const whereData: Record<string, any> = {};
      if (conflictTargetStr) {
        const targets = conflictTargetStr.split(",").map((t) => cleanQuotes(t));
        targets.forEach((target) => {
          const fieldDef = schemaModel?.fields.find(
            (f) => f.dbName === target || f.name === target,
          );
          const finalPrismaField = fieldDef ? fieldDef.name : target;
          whereData[finalPrismaField] = createData[finalPrismaField] || "";
        });
      } else {
        const idField = schemaModel?.fields.find((f) => f.isId);
        if (idField && createData[idField.name] !== undefined) {
          whereData[idField.name] = createData[idField.name];
        } else {
          const emailField = schemaModel?.fields.find((f) =>
            f.name.toLowerCase().includes("email"),
          );
          if (emailField && createData[emailField.name] !== undefined) {
            whereData[emailField.name] = createData[emailField.name];
          } else if (columns[0]) {
            const firstCol = columns[0];
            const fieldDef = schemaModel?.fields.find(
              (f) => f.dbName === firstCol || f.name === firstCol,
            );
            const firstPrismaField = fieldDef ? fieldDef.name : firstCol;
            whereData[firstPrismaField] = createData[firstPrismaField];
          }
        }
      }

      const queryObj = {
        where: whereData,
        update: updateData,
        create: createData,
      };

      const prismaOutput = `prisma.${camelModelVar}.upsert(${formatPrismaObject(queryObj)})`;
      const ast: AstNode = {
        type: "SqlUpsertQuery",
        name: baseModelName,
        properties: { table: rawTableName, operation: "upsert" },
      };
      return { prisma: prismaOutput, ast };
    } else {
      if (rows.length > 1) {
        const records = rows.map((row) => {
          const record: Record<string, any> = {};
          columns.forEach((col, idx) => {
            const fieldDef = schemaModel?.fields.find(
              (f) => f.dbName === col || f.name === col,
            );
            const finalPrismaField = fieldDef ? fieldDef.name : col;
            record[finalPrismaField] = row[idx];
          });
          return record;
        });

        const queryObj = {
          data: records,
        };
        const prismaOutput = `prisma.${camelModelVar}.createMany(${formatPrismaObject(queryObj)})`;
        const ast: AstNode = {
          type: "SqlInsertManyQuery",
          name: baseModelName,
          properties: { table: rawTableName, operation: "createMany" },
        };
        return { prisma: prismaOutput, ast };
      } else {
        const createData: Record<string, any> = {};
        columns.forEach((col, idx) => {
          const fieldDef = schemaModel?.fields.find(
            (f) => f.dbName === col || f.name === col,
          );
          const finalPrismaField = fieldDef ? fieldDef.name : col;
          createData[finalPrismaField] = rows[0] ? rows[0][idx] : undefined;
        });

        const queryObj = {
          data: createData,
        };
        const prismaOutput = `prisma.${camelModelVar}.create(${formatPrismaObject(queryObj)})`;
        const ast: AstNode = {
          type: "SqlInsertQuery",
          name: baseModelName,
          properties: { table: rawTableName, operation: "create" },
        };
        return { prisma: prismaOutput, ast };
      }
    }
  }

  if (upperSql.startsWith("UPDATE")) {
    const updateRegex =
      /UPDATE\s+(\w+|"[^"]+"|`[^`]+`)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?)|$)/i;
    const match = cleanSql.match(updateRegex);
    if (!match) {
      throw new Error(
        "Could not parse UPDATE statement. Please verify SQL syntax e.g. UPDATE table SET col = val WHERE id = 1;",
      );
    }
    const rawTableName = cleanQuotes(match[1]);
    const setsStr = match[2];
    const whereStr = match[3] || "";

    const schemaModel = schema?.models.find(
      (m) =>
        m.dbName === rawTableName ||
        m.name.toLowerCase() === rawTableName.toLowerCase(),
    );
    const baseModelName =
      schemaModel ? schemaModel.name : camelCase(singularize(rawTableName));
    const camelModelVar = camelCase(baseModelName);

    const updateData: Record<string, any> = {};
    const sets = setsStr.split(",").map((s) => s.trim());
    sets.forEach((set) => {
      const parts = set.split(/\s*=\s*/);
      if (parts.length === 2) {
        const col = cleanQuotes(parts[0]);
        const val = parseSqlValue(parts[1].replace(/;$/, ""));
        const fieldDef = schemaModel?.fields.find(
          (f) => f.dbName === col || f.name === col,
        );
        const finalPrismaField = fieldDef ? fieldDef.name : col;
        updateData[finalPrismaField] = val;
      }
    });

    const prismaWhere: Record<string, any> = {};
    if (whereStr) {
      const conds = whereStr.split(/\s+AND\s+/i);
      conds.forEach((cond) => {
        const opRegex = /^(.*?)\s*(=|!=|<>|>|>=|<|<=|LIKE|IN)\s*(.*)$/i;
        const match = cond.match(opRegex);
        if (match) {
          const fieldExpr = cleanQuotes(match[1]);
          const op = match[2].toUpperCase();
          const rawVal = match[3].trim();

          const fieldDef = schemaModel?.fields.find(
            (f) => f.dbName === fieldExpr || f.name === fieldExpr,
          );
          const finalPrismaField = fieldDef ? fieldDef.name : fieldExpr;
          const typedVal = parseSqlValue(rawVal);

          let prismaOpVal: any = typedVal;
          if (op === "LIKE") {
            const stringVal = String(typedVal).replace(/%/g, "");
            if (
              String(typedVal).startsWith("%") &&
              String(typedVal).endsWith("%")
            ) {
              prismaOpVal = { contains: stringVal };
            } else if (String(typedVal).startsWith("%")) {
              prismaOpVal = { endsWith: stringVal };
            } else {
              prismaOpVal = { startsWith: stringVal };
            }
          } else if (op === "IN") {
            const listStr = rawVal.replace(/[()]/g, "");
            const items = listStr
              .split(",")
              .map((s) => parseSqlValue(s.trim()));
            prismaOpVal = { in: items };
          } else if (op === "!=") {
            prismaOpVal = { not: typedVal };
          } else if (op === "<>") {
            prismaOpVal = { not: typedVal };
          } else if (op === ">") {
            prismaOpVal = { gt: typedVal };
          } else if (op === ">=") {
            prismaOpVal = { gte: typedVal };
          } else if (op === "<") {
            prismaOpVal = { lt: typedVal };
          } else if (op === "<=") {
            prismaOpVal = { lte: typedVal };
          }

          prismaWhere[finalPrismaField] = prismaOpVal;
        }
      });
    }

    const queryObj: Record<string, any> = {
      data: updateData,
    };
    if (Object.keys(prismaWhere).length > 0) {
      queryObj.where = prismaWhere;
    }

    const isSingle = Object.keys(prismaWhere).some(
      (k) => k.toLowerCase() === "id" || k.toLowerCase().includes("email"),
    );
    const operationName = isSingle ? "update" : "updateMany";

    const prismaOutput = `prisma.${camelModelVar}.${operationName}(${formatPrismaObject(queryObj)})`;
    const ast: AstNode = {
      type: "SqlUpdateQuery",
      name: baseModelName,
      properties: { table: rawTableName, operation: operationName },
    };
    return { prisma: prismaOutput, ast };
  }

  if (upperSql.startsWith("DELETE")) {
    const deleteRegex =
      /DELETE\s+FROM\s+(\w+|"[^"]+"|`[^`]+`)(?:\s+WHERE\s+(.*?)|$)/i;
    const match = cleanSql.match(deleteRegex);
    if (!match) {
      throw new Error(
        "Could not parse DELETE statement. Please verify SQL syntax e.g. DELETE FROM table WHERE id = 1;",
      );
    }
    const rawTableName = cleanQuotes(match[1]);
    const whereStr = match[2] || "";

    const schemaModel = schema?.models.find(
      (m) =>
        m.dbName === rawTableName ||
        m.name.toLowerCase() === rawTableName.toLowerCase(),
    );
    const baseModelName =
      schemaModel ? schemaModel.name : camelCase(singularize(rawTableName));
    const camelModelVar = camelCase(baseModelName);

    const prismaWhere: Record<string, any> = {};
    if (whereStr) {
      const conds = whereStr.split(/\s+AND\s+/i);
      conds.forEach((cond) => {
        const opRegex = /^(.*?)\s*(=|!=|<>|>|>=|<|<=|LIKE|IN)\s*(.*)$/i;
        const match = cond.match(opRegex);
        if (match) {
          const fieldExpr = cleanQuotes(match[1]);
          const op = match[2].toUpperCase();
          const rawVal = match[3].trim();

          const fieldDef = schemaModel?.fields.find(
            (f) => f.dbName === fieldExpr || f.name === fieldExpr,
          );
          const finalPrismaField = fieldDef ? fieldDef.name : fieldExpr;
          const typedVal = parseSqlValue(rawVal);

          let prismaOpVal: any = typedVal;
          if (op === "LIKE") {
            const stringVal = String(typedVal).replace(/%/g, "");
            if (
              String(typedVal).startsWith("%") &&
              String(typedVal).endsWith("%")
            ) {
              prismaOpVal = { contains: stringVal };
            } else if (String(typedVal).startsWith("%")) {
              prismaOpVal = { endsWith: stringVal };
            } else {
              prismaOpVal = { startsWith: stringVal };
            }
          } else if (op === "IN") {
            const listStr = rawVal.replace(/[()]/g, "");
            const items = listStr
              .split(",")
              .map((s) => parseSqlValue(s.trim()));
            prismaOpVal = { in: items };
          } else if (op === "!=") {
            prismaOpVal = { not: typedVal };
          } else if (op === "<>") {
            prismaOpVal = { not: typedVal };
          } else if (op === ">") {
            prismaOpVal = { gt: typedVal };
          } else if (op === ">=") {
            prismaOpVal = { gte: typedVal };
          } else if (op === "<") {
            prismaOpVal = { lt: typedVal };
          } else if (op === "<=") {
            prismaOpVal = { lte: typedVal };
          }

          prismaWhere[finalPrismaField] = prismaOpVal;
        }
      });
    }

    const queryObj: Record<string, any> = {};
    if (Object.keys(prismaWhere).length > 0) {
      queryObj.where = prismaWhere;
    }

    const isSingle = Object.keys(prismaWhere).some(
      (k) => k.toLowerCase() === "id" || k.toLowerCase().includes("email"),
    );
    const operationName = isSingle ? "delete" : "deleteMany";

    const prismaOutput = `prisma.${camelModelVar}.${operationName}(${formatPrismaObject(queryObj)})`;
    const ast: AstNode = {
      type: "SqlDeleteQuery",
      name: baseModelName,
      properties: { table: rawTableName, operation: operationName },
    };
    return { prisma: prismaOutput, ast };
  }

  // Standard simple tokenizer/matcher for primary SQL clauses
  const selectRegex = /SELECT\s+(.*?)\s+FROM/i;
  const fromRegex =
    /FROM\s+(.*?)(?=\s*(?:LEFT|INNER|RIGHT|FULL)?\s*JOIN|\s*WHERE|\s*ORDER BY|\s*LIMIT|\s*OFFSET|;|$)/i;
  const joinRegex =
    /(?:LEFT|INNER|RIGHT|FULL)?\s*JOIN\s+(\w+|"[^"]+")\s*(?:AS)?\s*(\w+)?\s+ON\s+([\s\S]*?)(?=\s*(?:LEFT|INNER|RIGHT|FULL)?\s*JOIN|\s*WHERE|\s*ORDER BY|\s*LIMIT|\s*OFFSET|;|$)/gi;
  const whereRegex = /WHERE\s+(.*?)(?=\s*ORDER BY|\s*LIMIT|\s*OFFSET|;|$)/i;
  const orderByRegex = /ORDER\s+BY\s+(.*?)(?=\s*LIMIT|\s*OFFSET|;|$)/i;
  const limitRegex = /LIMIT\s+(\d+)/i;
  const offsetRegex = /OFFSET\s+(\d+)/i;

  const selectMatch = cleanSql.match(selectRegex);
  const fromMatch = cleanSql.match(fromRegex);
  const whereMatch = cleanSql.match(whereRegex);
  const orderByMatch = cleanSql.match(orderByRegex);
  const limitMatch = cleanSql.match(limitRegex);
  const offsetMatch = cleanSql.match(offsetRegex);

  if (!fromMatch) {
    throw new Error(
      "Could not parse target table in FROM clause. Please verify SQL syntax.",
    );
  }

  // 1. Resolve Base Table & Model
  const fromClause = fromMatch[1].trim();
  // Handles "User" u or "User" AS u or User
  const fromParts = fromClause.split(/\s+(?:AS\s+)?/i);
  const rawBaseTableName = cleanQuotes(fromParts[0]);
  const baseTableAlias =
    fromParts[1] ? cleanQuotes(fromParts[1]) : rawBaseTableName;

  // Resolve model name
  const schemaModel = schema?.models.find(
    (m) =>
      m.dbName === rawBaseTableName ||
      m.name.toLowerCase() === rawBaseTableName.toLowerCase(),
  );
  const baseModelName =
    schemaModel ? schemaModel.name : camelCase(singularize(rawBaseTableName));

  // 2. Parse Joins & Map Alias paths
  const aliasToPathMap: Record<string, string[]> = {};
  aliasToPathMap[baseTableAlias] = [];

  const aliasToModelMap: Record<string, string> = {};
  aliasToModelMap[baseTableAlias] = baseModelName;

  const joins: { table: string; alias: string; on: string }[] = [];
  let joinMatch;
  // Reset index
  joinRegex.lastIndex = 0;

  while ((joinMatch = joinRegex.exec(cleanSql)) !== null) {
    const joinTable = cleanQuotes(joinMatch[1]);
    const rawJoinAlias = joinMatch[2] ? cleanQuotes(joinMatch[2]) : joinTable;
    const joinOn = joinMatch[3].trim();

    joins.push({ table: joinTable, alias: rawJoinAlias, on: joinOn });
  }

  // Iteratively map joins to construct nesting hierarchies based on relational linking
  // To deal with out-of-order joins, we loop up to N times
  for (let cycle = 0; cycle < joins.length + 1; cycle++) {
    joins.forEach((join) => {
      if (aliasToPathMap[join.alias]) return; // already registered

      // Try to find which registered alias this join links to
      // We parse the ON condition, e.g., "u.id = p.author_id"
      const onParts = join.on.split(/\s*=\s*/);
      let matchedParentAlias = "";

      onParts.forEach((part) => {
        const aliasPrefix = part.split(".")[0]?.trim();
        const cleanPrefix = cleanQuotes(aliasPrefix);
        if (
          aliasToPathMap[cleanPrefix] !== undefined &&
          cleanPrefix !== join.alias
        ) {
          matchedParentAlias = cleanPrefix;
        }
      });

      if (matchedParentAlias) {
        const parentPath = aliasToPathMap[matchedParentAlias];
        const parentModelName = aliasToModelMap[matchedParentAlias];
        const parentModelDef = schema?.models.find(
          (m) => m.name === parentModelName,
        );

        // Find the relation field on parentModelDef that points to join.table
        let relationKey = "";
        if (parentModelDef) {
          const relField = parentModelDef.fields.find(
            (f) =>
              f.isRelation &&
              (f.relationModel?.toLowerCase() === join.table.toLowerCase() ||
                findModel(f.relationModel || "")?.dbName?.toLowerCase() ===
                  join.table.toLowerCase()),
          );
          if (relField) {
            relationKey = relField.name;
          }
        }

        // Fallback if not found in schema
        if (!relationKey) {
          relationKey = camelCase(join.alias);
        }

        aliasToPathMap[join.alias] = [...parentPath, relationKey];

        const rModel = schema?.models.find(
          (m) =>
            m.dbName === join.table ||
            m.name.toLowerCase() === join.table.toLowerCase(),
        );
        aliasToModelMap[join.alias] =
          rModel ? rModel.name : camelCase(singularize(join.table));
      }
    });
  }

  // 3. Parse Columns for SELECT/INCLUDE Nesting
  const selectColsStr = selectMatch ? selectMatch[1] : "*";
  const columns = selectColsStr.split(/,(?![^(]*\))/).map((s) => s.trim());

  const prismaSelect: Record<string, any> = {};

  columns.forEach((col) => {
    if (col === "*") {
      // select all (represented by empty select or custom keys)
      return;
    }

    // Handles "u.email AS user_email" or "u.email"
    const colParts = col.split(/\s+(?:AS\s+)?/i);
    const colExpr = colParts[0].trim();
    const colAlias = colParts[1] ? cleanQuotes(colParts[1]) : undefined;

    const exprParts = colExpr.split(".");
    let tableAlias = baseTableAlias;
    let fieldName = colExpr;

    if (exprParts.length > 1) {
      tableAlias = cleanQuotes(exprParts[0]);
      fieldName = cleanQuotes(exprParts[1]);
    }

    const relationPath = aliasToPathMap[tableAlias];
    if (relationPath === undefined) {
      // Unknown table, place at root level
      prismaSelect[fieldName] = true;
      return;
    }

    // Traverse the nested prismaSelect object to place the column
    let current = prismaSelect;
    relationPath.forEach((pathNode) => {
      if (!current[pathNode]) {
        current[pathNode] = { select: {} };
      } else if (current[pathNode] === true) {
        current[pathNode] = { select: {} };
      }
      current = current[pathNode].select;
    });

    // Translate database column name to Prisma field name
    const modelName = aliasToModelMap[tableAlias];
    const modelDef = schema?.models.find((m) => m.name === modelName);
    const fieldDef = modelDef?.fields.find(
      (f) => f.dbName === fieldName || f.name === fieldName,
    );
    const finalPrismaField = fieldDef ? fieldDef.name : fieldName;

    current[finalPrismaField] = true;
  });

  // 4. Translate SQL WHERE to Prisma where object
  const prismaWhere: Record<string, any> = {};

  if (whereMatch) {
    const rawWhere = whereMatch[1].trim();
    // A simplified tokenizer for AND/OR splits
    // We can support simple direct AND structures or split by AND
    const conds = rawWhere.split(/\s+AND\s+/i);

    conds.forEach((cond) => {
      // Handles: u.role = 'ADMIN' or p.published = true or id = 1
      const opRegex = /^(.*?)\s*(=|!=|<>|>|>=|<|<=|LIKE|IN)\s*(.*)$/i;
      const match = cond.match(opRegex);

      if (match) {
        let fieldExpr = match[1].trim();
        const op = match[2].toUpperCase();
        const rawVal = match[3].trim();

        let tableAlias = baseTableAlias;
        let fieldName = fieldExpr;

        const exprParts = fieldExpr.split(".");
        if (exprParts.length > 1) {
          tableAlias = cleanQuotes(exprParts[0]);
          fieldName = cleanQuotes(exprParts[1]);
        }

        const relationPath = aliasToPathMap[tableAlias];
        const modelName = aliasToModelMap[tableAlias];
        const modelDef = schema?.models.find((m) => m.name === modelName);
        const fieldDef = modelDef?.fields.find(
          (f) => f.dbName === fieldName || f.name === fieldName,
        );
        const finalPrismaField = fieldDef ? fieldDef.name : fieldName;

        const typedVal = parseSqlValue(rawVal);

        // Build Prisma condition structure
        let prismaOpVal: any = typedVal;
        if (op === "LIKE") {
          const stringVal = String(typedVal).replace(/%/g, "");
          if (
            String(typedVal).startsWith("%") &&
            String(typedVal).endsWith("%")
          ) {
            prismaOpVal = { contains: stringVal };
          } else if (String(typedVal).startsWith("%")) {
            prismaOpVal = { endsWith: stringVal };
          } else {
            prismaOpVal = { startsWith: stringVal };
          }
        } else if (op === "IN") {
          // Parse values (1, 2, 3)
          const listStr = rawVal.replace(/[()]/g, "");
          const items = listStr.split(",").map((s) => parseSqlValue(s.trim()));
          prismaOpVal = { in: items };
        } else if (op === "!=") {
          prismaOpVal = { not: typedVal };
        } else if (op === "<>") {
          prismaOpVal = { not: typedVal };
        } else if (op === ">") {
          prismaOpVal = { gt: typedVal };
        } else if (op === ">=") {
          prismaOpVal = { gte: typedVal };
        } else if (op === "<") {
          prismaOpVal = { lt: typedVal };
        } else if (op === "<=") {
          prismaOpVal = { lte: typedVal };
        }

        if (relationPath && relationPath.length > 0) {
          // It belongs to a related model (nested)
          let current = prismaWhere;
          relationPath.forEach((pathNode) => {
            if (!current[pathNode]) {
              current[pathNode] = { some: {} }; // Default nested condition
            }
            current = current[pathNode].some;
          });
          current[finalPrismaField] = prismaOpVal;
        } else {
          // Root level
          prismaWhere[finalPrismaField] = prismaOpVal;
        }
      }
    });
  }

  // 5. Parse Order By, Limit, Offset
  const prismaOrderBy: Record<string, any> = {};
  if (orderByMatch) {
    const orders = orderByMatch[1].split(",");
    orders.forEach((o) => {
      const parts = o.trim().split(/\s+/);
      const colExpr = parts[0];
      const dir = parts[1] ? parts[1].toLowerCase() : "asc";
      const colName = colExpr.includes(".") ? colExpr.split(".")[1] : colExpr;
      prismaOrderBy[cleanQuotes(colName)] = dir;
    });
  }

  // 6. Build final Prisma Javascript snippet
  const queryObj: Record<string, any> = {};
  if (Object.keys(prismaWhere).length > 0) queryObj.where = prismaWhere;
  if (Object.keys(prismaSelect).length > 0) queryObj.select = prismaSelect;
  if (Object.keys(prismaOrderBy).length > 0) queryObj.orderBy = prismaOrderBy;

  if (limitMatch) {
    queryObj.take = parseInt(limitMatch[1], 10);
  }
  if (offsetMatch) {
    queryObj.skip = parseInt(offsetMatch[1], 10);
  }

  const camelModelVar = camelCase(baseModelName);
  const prettyJson = formatPrismaObject(queryObj);
  const prismaOutput = `prisma.${camelModelVar}.findMany(${prettyJson})`;

  // Build AST for SQL
  const ast: AstNode = {
    type: "SqlQuery",
    name: baseModelName,
    properties: {
      table: rawBaseTableName,
      alias: baseTableAlias,
    },
    children: [
      {
        type: "SelectFields",
        children: columns.map((c) => ({ type: "Field", name: c })),
      },
    ],
  };

  if (joins.length > 0) {
    ast.children?.push({
      type: "Joins",
      children: joins.map((j) => ({
        type: "Join",
        name: j.alias,
        value: j.table,
        properties: { on: j.on },
      })),
    });
  }

  if (whereMatch) {
    ast.children?.push({
      type: "WhereClause",
      value: whereMatch[1].trim(),
    });
  }

  return { prisma: prismaOutput, ast };
}

function parseSqlValue(val: string): any {
  if (val.toLowerCase() === "null") return null;
  if (val.toLowerCase() === "true") return true;
  if (val.toLowerCase() === "false") return false;

  // String literals
  if (
    (val.startsWith("'") && val.endsWith("'")) ||
    (val.startsWith('"') && val.endsWith('"'))
  ) {
    return val.slice(1, -1);
  }

  // Numeric literals
  const num = Number(val);
  if (!isNaN(num)) return num;

  return val;
}

// Pretty formats a JS object literal as standard code indentation string
function formatPrismaObject(obj: any, indent = 2): string {
  const spaces = " ".repeat(indent);
  const nestedSpaces = " ".repeat(indent + 2);

  if (obj === null) return "null";
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj
      .map((item) => formatPrismaObject(item, indent + 2))
      .join(", ");
    return `[${items}]`;
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";

    const lines = keys.map((key) => {
      const val = obj[key];
      const formattedVal = formatPrismaObject(val, indent + 2);
      // Clean identifier format for JS keys
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      return `${nestedSpaces}${safeKey}: ${formattedVal}`;
    });

    return `{\n${lines.join(",\n")}\n${spaces}}`;
  }

  if (typeof obj === "string") {
    return `'${obj.replace(/'/g, "\\'")}'`;
  }

  return String(obj);
}

// ==========================================
// 4. Heuristic string cleaning and inflection helpers
// ==========================================

function cleanQuotes(str: string): string {
  if (!str) return "";
  return str.trim().replace(/^["'`]|["'`]$/g, "");
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str: string): string {
  if (!str) return "";
  const cleaned = cleanQuotes(str);
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function singularize(str: string): string {
  const clean = cleanQuotes(str);
  if (clean.endsWith("ies")) {
    return clean.slice(0, -3) + "y";
  }
  if (clean.endsWith("s") && !clean.endsWith("ss")) {
    return clean.slice(0, -1);
  }
  return clean;
}

// ==========================================
// 5. Query static performance suggestions & analysis
// ==========================================

export function analyzeQueryStatic(
  sql: string,
  baseModel: string,
  schema?: QuerySchema,
): {
  performanceScore: number;
  warnings: string[];
  indexSuggestions: IndexSuggestion[];
  complexityLevel: "Low" | "Medium" | "High";
} {
  const warnings: string[] = [];
  const indexSuggestions: IndexSuggestion[] = [];
  let score = 100;

  // 1. Check for SELECT * which degrades database memory efficiency
  if (sql.includes("*") || /SELECT\s+\w+\.\*/i.test(sql)) {
    score -= 15;
    warnings.push(
      'The query uses "SELECT *" or unconstrained select. Consider selecting explicit columns for better database projection performance.',
    );
  }

  // 2. Scan JOINs and verify join index optimization
  const joinRegex =
    /JOIN\s+(\w+|"[^"]+")\s*(?:AS)?\s*(\w+)?\s+ON\s+(.*?)(?=\s*(?:LEFT|INNER|RIGHT|FULL)?\s*JOIN|\s*WHERE|\s*ORDER BY|\s*LIMIT|\s*OFFSET|;|$)/gi;
  let matches;
  joinRegex.lastIndex = 0;
  let joinCount = 0;

  while ((matches = joinRegex.exec(sql)) !== null) {
    joinCount++;
    const tableName = cleanQuotes(matches[1]);
    const onClause = matches[3];

    // Check link columns
    // We expect join columns to have indexes
    const eqParts = onClause.split(/\s*=\s*/);
    eqParts.forEach((part) => {
      const colParts = part.split(".");
      if (colParts.length > 1) {
        const colName = cleanQuotes(colParts[1]);
        if (
          colName.toLowerCase().endsWith("id") &&
          colName.toLowerCase() !== "id"
        ) {
          // Suggest foreign key indexes
          indexSuggestions.push({
            table: tableName,
            columns: [colName],
            reason: `Optimizes the LEFT JOIN condition linked on foreign key column '${colName}'.`,
            sql: `CREATE INDEX idx_${tableName.toLowerCase()}_${colName.toLowerCase()} ON "${tableName}"("${colName}");`,
          });
        }
      }
    });
  }

  if (joinCount > 3) {
    score -= 15;
    warnings.push(
      `High relational overhead: The query includes ${joinCount} table JOINs. Ensure proper indexing and cache frequently matched parameters.`,
    );
  }

  // 3. Scan WHERE filters for potential scans
  const whereMatch = sql.match(/WHERE\s+(.*)/i);
  if (whereMatch) {
    const rawWhere = whereMatch[1];
    // Check if LIKE wildcard starts with % (disables B-tree indexing)
    if (/%[a-zA-Z0-9_]+%'/i.test(rawWhere) || /LIKE\s+'%/i.test(rawWhere)) {
      score -= 20;
      warnings.push(
        'A B-tree index cannot be fully utilized because the WHERE LIKE condition starts with a wildcard wildcard ("%..."). Consider Postgres Full-Text Search (tsvector) or Elasticsearch.',
      );
    }
  }

  // Calculate complexity level
  let complexityLevel: "Low" | "Medium" | "High" = "Low";
  if (joinCount > 2) complexityLevel = "High";
  else if (joinCount > 0 || sql.includes("WHERE")) complexityLevel = "Medium";

  // Deduplicate index suggestions
  const uniqIndexes = indexSuggestions.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.table === item.table &&
          t.columns.join(",") === item.columns.join(","),
      ),
  );

  return {
    performanceScore: Math.max(score, 10),
    warnings,
    indexSuggestions: uniqIndexes,
    complexityLevel,
  };
}
