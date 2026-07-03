function quote(value: unknown): string {
  if (value === null) return "NULL";

  if (typeof value === "number")
    return value.toString();

  if (typeof value === "boolean")
    return value ? "TRUE" : "FALSE";

  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildFieldCondition(
  field: string,
  value: any,
): string {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return `${field} = ${quote(value)}`;
  }

  const conditions: string[] = [];

  for (const operator of Object.keys(value)) {
    const operatorValue = value[operator];

    switch (operator) {
      case "equals":
        conditions.push(
          `${field} = ${quote(operatorValue)}`
        );
        break;

      case "not":
        conditions.push(
          `${field} <> ${quote(operatorValue)}`
        );
        break;

      case "gt":
        conditions.push(
          `${field} > ${quote(operatorValue)}`
        );
        break;

      case "gte":
        conditions.push(
          `${field} >= ${quote(operatorValue)}`
        );
        break;

      case "lt":
        conditions.push(
          `${field} < ${quote(operatorValue)}`
        );
        break;

      case "lte":
        conditions.push(
          `${field} <= ${quote(operatorValue)}`
        );
        break;

      case "contains":
        conditions.push(
          `${field} LIKE '%${operatorValue}%'`
        );
        break;

      case "startsWith":
        conditions.push(
          `${field} LIKE '${operatorValue}%'`
        );
        break;

      case "endsWith":
        conditions.push(
          `${field} LIKE '%${operatorValue}'`
        );
        break;

      case "in":
        conditions.push(
          `${field} IN (${operatorValue
            .map(quote)
            .join(", ")})`
        );
        break;

      case "notIn":
        conditions.push(
          `${field} NOT IN (${operatorValue
            .map(quote)
            .join(", ")})`
        );
        break;
    }
  }

  return conditions.join(" AND ");
}

export function buildWhere(where?: Record<string, any>): string {
  if (!where || Object.keys(where).length === 0)
    return "";

  const parts: string[] = [];

  for (const key of Object.keys(where)) {
    if (key === "AND") {
      const sql = where.AND.map(buildWhere)
        .map((x: string) => x.replace(/^WHERE\s+/i, ""))
        .join(" AND ");

      parts.push(`(${sql})`);

      continue;
    }

    if (key === "OR") {
      const sql = where.OR.map(buildWhere)
        .map((x: string) => x.replace(/^WHERE\s+/i, ""))
        .join(" OR ");

      parts.push(`(${sql})`);

      continue;
    }

    if (key === "NOT") {
      const sql = buildWhere(where.NOT)
        .replace(/^WHERE\s+/i, "");

      parts.push(`NOT (${sql})`);

      continue;
    }

    parts.push(
      buildFieldCondition(
        key,
        where[key],
      ),
    );
  }

 
  return parts.length
  ? ` WHERE ${parts.join(" AND ")}`
  : "";
}