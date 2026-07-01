/** Convert a SQL query string to equivalent Prisma code. */
export function sqlToPrisma(sql: string): string {
  const trimmed = sql.trim().replace(/;\s*$/, "");
  const upper = trimmed.toUpperCase();

  if (upper.startsWith("SELECT")) return selectToPrisma(trimmed);
  if (upper.startsWith("INSERT")) return insertToPrisma(trimmed);
  if (upper.startsWith("UPDATE")) return updateToPrisma(trimmed);
  if (upper.startsWith("DELETE")) return deleteToPrisma(trimmed);

  return "// Unsupported SQL statement. Supported: SELECT, INSERT, UPDATE, DELETE";
}

function tableNameToModel(table: string): string {
  let singular = table;
  if (singular.endsWith("ies")) {
    singular = singular.slice(0, -3) + "y";
  } else if (
    singular.endsWith("ses") ||
    singular.endsWith("xes") ||
    singular.endsWith("ches") ||
    singular.endsWith("shes")
  ) {
    singular = singular.slice(0, -2);
  } else if (singular.endsWith("s") && !singular.endsWith("ss")) {
    singular = singular.slice(0, -1);
  }
  return singular
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function colToCamel(col: string): string {
  return col
    .split("_")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

function parseSqlValue(val: string): string | number | boolean | null {
  const trimmed = val.trim();
  if (trimmed.toUpperCase() === "NULL") return null;
  if (trimmed.toUpperCase() === "TRUE") return true;
  if (trimmed.toUpperCase() === "FALSE") return false;
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;
  return trimmed;
}

function sqlWhereToPrismaWhere(whereClause: string): string {
  let where = whereClause.trim();

  const orParts = splitByTopLevel(where, " OR ");
  const andParts = splitByTopLevel(where, " AND ");

  if (orParts.length > 1) {
    const conditions = orParts.map((part) => parseCondition(part.trim()));
    return `{\n    OR: [\n${conditions.map((c) => `      ${c}`).join(",\n")}\n    ]\n  }`;
  }

  if (andParts.length > 1) {
    const conditions = andParts.map((part) => parseCondition(part.trim()));
    return `{\n${conditions.map((c) => `    ${c}`).join(",\n")}\n  }`;
  }

  return `{\n    ${parseCondition(where.trim())}\n  }`;
}

function splitByTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (
      depth === 0 &&
      input.slice(i, i + delimiter.length) === delimiter
    ) {
      parts.push(current);
      current = "";
      i += delimiter.length - 1;
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function parseCondition(cond: string): string {
  let trimmed = cond.trim();
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  const notMatch = trimmed.match(/^NOT\s+(.+)$/i);
  if (notMatch) {
    return `NOT ${parseCondition(notMatch[1])}`;
  }

  const inMatch = trimmed.match(/^(\w+(?:\.\w+)?)\s+NOT\s+IN\s*\(([^)]+)\)$/i);
  if (inMatch) {
    const col = colToCamel(inMatch[1].split(".")[0]);
    const values = inMatch[2].split(",").map((v) => parseSqlValue(v.trim()));
    return `${col}: { notIn: ${JSON.stringify(values)} }`;
  }

  const inMatch2 = trimmed.match(/^(\w+(?:\.\w+)?)\s+IN\s*\(([^)]+)\)$/i);
  if (inMatch2) {
    const col = colToCamel(inMatch2[1].split(".")[0]);
    const values = inMatch2[2].split(",").map((v) => parseSqlValue(v.trim()));
    return `${col}: { in: ${JSON.stringify(values)} }`;
  }

  const isNotNull = trimmed.match(/^(\w+(?:\.\w+)?)\s+IS\s+NOT\s+NULL$/i);
  if (isNotNull) {
    const col = colToCamel(isNotNull[1].split(".")[0]);
    return `${col}: { not: null }`;
  }

  const isNull = trimmed.match(/^(\w+(?:\.\w+)?)\s+IS\s+NULL$/i);
  if (isNull) {
    const col = colToCamel(isNull[1].split(".")[0]);
    return `${col}: null`;
  }

  const likeMatch = trimmed.match(
    /^(\w+(?:\.\w+)?)\s+(?:NOT\s+)?LIKE\s+'([^']+)'$/i,
  );
  if (likeMatch) {
    const col = colToCamel(likeMatch[1].split(".")[0]);
    const pattern = likeMatch[2];
    const isNot = trimmed.toUpperCase().includes("NOT LIKE");

    if (pattern.startsWith("%") && pattern.endsWith("%")) {
      const val = pattern.slice(1, -1);
      return isNot ?
          `${col}: { not: { contains: ${JSON.stringify(val)} } }`
        : `${col}: { contains: ${JSON.stringify(val)} }`;
    }
    if (pattern.startsWith("%")) {
      const val = pattern.slice(1);
      return isNot ?
          `${col}: { not: { endsWith: ${JSON.stringify(val)} } }`
        : `${col}: { endsWith: ${JSON.stringify(val)} }`;
    }
    if (pattern.endsWith("%")) {
      const val = pattern.slice(0, -1);
      return isNot ?
          `${col}: { not: { startsWith: ${JSON.stringify(val)} } }`
        : `${col}: { startsWith: ${JSON.stringify(val)} }`;
    }
    return isNot ?
        `${col}: { not: { equals: ${JSON.stringify(pattern)} } }`
      : `${col}: { equals: ${JSON.stringify(pattern)} }`;
  }

  const compMatch = trimmed.match(
    /^(\w+(?:\.\w+)?)\s*(>=|<=|!=|<>|>|<|=)\s*(.+)$/i,
  );
  if (compMatch) {
    const col = colToCamel(compMatch[1].split(".")[0]);
    const op = compMatch[2].toUpperCase();
    const val = parseSqlValue(compMatch[3]);

    const opMap: Record<string, string> = {
      "=": "equals",
      "!=": "not",
      "<>": "not",
      ">": "gt",
      ">=": "gte",
      "<": "lt",
      "<=": "lte",
    };

    const prismaOp = opMap[op] ?? "equals";
    return `${col}: { ${prismaOp}: ${JSON.stringify(val)} }`;
  }

  return `// TODO: ${trimmed}`;
}

function selectToPrisma(sql: string): string {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch) return "// Could not detect table name";

  const model = tableNameToModel(tableMatch[1]);

  const whereMatch = sql.match(
    /WHERE\s+([\s\S]+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|\s*$)/i,
  );
  const orderByMatch = sql.match(
    /ORDER\s+BY\s+([\s\S]+?)(?:\s+LIMIT|\s+OFFSET|\s*$)/i,
  );
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
  const groupByMatch = sql.match(
    /GROUP\s+BY\s+([\s\S]+?)(?:\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|\s*OFFSET|\s*$)/i,
  );

  const isCount = /COUNT\(\s*\*\s*\)/i.test(sql) && !groupByMatch;
  if (isCount) {
    let result = `prisma.${model}.count({`;
    if (whereMatch) {
      result += `\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])}`;
    }
    result += "\n})";
    return result;
  }

  const isAggregate = /(SUM|AVG|MIN|MAX)\s*\(/i.test(sql) && !groupByMatch;
  if (isAggregate) {
    const aggParts: string[] = [];
    const sumMatch = sql.matchAll(/SUM\((\w+)\)\s+AS\s+(\w+)/gi);
    const avgMatch = sql.matchAll(/AVG\((\w+)\)\s+AS\s+(\w+)/gi);
    const minMatch = sql.matchAll(/MIN\((\w+)\)\s+AS\s+(\w+)/gi);
    const maxMatch = sql.matchAll(/MAX\((\w+)\)\s+AS\s+(\w+)/gi);
    const countMatch = sql.matchAll(/COUNT\((\w+)\)\s+AS\s+(\w+)/gi);

    for (const m of sumMatch) aggParts.push(`${colToCamel(m[1])}: true`);
    for (const m of avgMatch) aggParts.push(`${colToCamel(m[1])}: true`);
    for (const m of minMatch) aggParts.push(`${colToCamel(m[1])}: true`);
    for (const m of maxMatch) aggParts.push(`${colToCamel(m[1])}: true`);
    for (const m of countMatch) aggParts.push(`${colToCamel(m[1])}: true`);

    let result = `prisma.${model}.aggregate({`;
    if (whereMatch) {
      result += `\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])},`;
    }
    if (aggParts.length > 0) {
      const aggType =
        /SUM/i.test(sql) ? "_sum"
        : /AVG/i.test(sql) ? "_avg"
        : /MIN/i.test(sql) ? "_min"
        : /MAX/i.test(sql) ? "_max"
        : "_count";
      result += `\n  ${aggType}: {\n    ${aggParts.join(",\n    ")}\n  }`;
    }
    result += "\n})";
    return result;
  }

  if (groupByMatch) {
    const byCols = groupByMatch[1]
      .split(",")
      .map((c) => `"${colToCamel(c.trim())}"`);
    let result = `prisma.${model}.groupBy({`;
    result += `\n  by: [${byCols.join(", ")}]`;
    if (whereMatch) {
      result += `,\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])}`;
    }
    if (orderByMatch) {
      const orderParts = orderByMatch[1].split(",").map((o) => {
        const [col, dir] = o.trim().split(/\s+/);
        return `"${colToCamel(col)}": "${dir?.toUpperCase() === "DESC" ? "desc" : "asc"}"`;
      });
      result += `,\n  orderBy: {\n    ${orderParts.join(",\n    ")}\n  }`;
    }
    if (limitMatch) result += `,\n  take: ${limitMatch[1]}`;
    if (offsetMatch) result += `,\n  skip: ${offsetMatch[1]}`;
    result += "\n})";
    return result;
  }

  let result = `prisma.${model}.findMany({`;

  if (whereMatch) {
    result += `\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])}`;
  }

  if (orderByMatch) {
    const orderParts = orderByMatch[1].split(",").map((o) => {
      const trimmed = o.trim();
      const match = trimmed.match(/^(\w+)(?:\s+(ASC|DESC))?$/i);
      if (!match) return null;
      const col = colToCamel(match[1]);
      const dir = match[2]?.toUpperCase() === "DESC" ? "desc" : "asc";
      return `${col}: "${dir}"`;
    });
    const validParts = orderParts.filter((p): p is string => p !== null);
    if (validParts.length > 0) {
      result += `,\n  orderBy: {\n    ${validParts.join(",\n    ")}\n  }`;
    }
  }

  if (limitMatch) result += `,\n  take: ${limitMatch[1]}`;
  if (offsetMatch) result += `,\n  skip: ${offsetMatch[1]}`;

  result += "\n})";
  return result;
}

function insertToPrisma(sql: string): string {
  const tableMatch = sql.match(/INTO\s+(\w+)/i);
  if (!tableMatch) return "// Could not detect table name";

  const model = tableNameToModel(tableMatch[1]);

  const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
  const valsMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);

  if (!colsMatch || !valsMatch)
    return "// Could not parse INSERT columns or values";

  const cols = colsMatch[1].split(",").map((c) => c.trim());
  const rawVals = valsMatch[1].split(",").map((v) => v.trim());

  const dataEntries = cols.map((col, i) => {
    const val = parseSqlValue(rawVals[i] ?? "NULL");
    return `    ${colToCamel(col)}: ${JSON.stringify(val)}`;
  });

  return `prisma.${model}.create({\n  data: {\n${dataEntries.join(",\n")}\n  }\n})`;
}

function updateToPrisma(sql: string): string {
  const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch) return "// Could not detect table name";

  const model = tableNameToModel(tableMatch[1]);

  const setMatch = sql.match(/SET\s+([\s\S]+?)(?:\s+WHERE|\s*$)/i);
  const whereMatch = sql.match(/WHERE\s+([\s\S]+)$/i);

  const setData: string[] = [];
  if (setMatch) {
    const assignments = setMatch[1].split(",").map((a) => a.trim());
    for (const assignment of assignments) {
      const eqMatch = assignment.match(/^(\w+(?:\.\w+)?)\s*=\s*(.+)$/i);
      if (eqMatch) {
        const col = colToCamel(eqMatch[1].split(".")[0]);
        const val = parseSqlValue(eqMatch[2]);
        setData.push(`    ${col}: ${JSON.stringify(val)}`);
      }
    }
  }

  let result = `prisma.${model}.updateMany({\n  data: {\n${setData.join(",\n")}\n  }`;
  if (whereMatch) {
    result += `,\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])}`;
  }
  result += "\n})";

  return result;
}

function deleteToPrisma(sql: string): string {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch) return "// Could not detect table name";

  const model = tableNameToModel(tableMatch[1]);

  const whereMatch = sql.match(/WHERE\s+([\s\S]+)$/i);

  let result = `prisma.${model}.deleteMany({`;
  if (whereMatch) {
    result += `\n  where: ${sqlWhereToPrismaWhere(whereMatch[1])}`;
  }
  result += "\n})";

  return result;
}
