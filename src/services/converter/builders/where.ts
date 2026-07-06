import { buildExpression } from "./expression";
import { buildValue } from "./value";

/* ----------------------------
   STRICT AST DETECTION
---------------------------- */
function isExpressionNode(value: any): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  return [
    "Literal",
    "Identifier",
    "CallExpression",
    "MemberExpression",
    "ArrayExpression",
    "NewExpression",
  ].includes(value.type);
}

/* ----------------------------
   FIELD CONDITION BUILDER
---------------------------- */
function buildFieldCondition(
  field: string,
  value: any,
): string {
  // Expression AST (uuid(), now(), etc.)
  if (isExpressionNode(value)) {
    return `${field} = ${buildExpression(value)}`;
  }

  // Primitive value
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return `${field} = ${buildValue(value)}`;
  }

  const conditions: string[] = [];

  for (const operator of Object.keys(value)) {
    const operatorValue = value[operator];

    switch (operator) {
      case "equals":
        conditions.push(
          `${field} = ${buildValue(operatorValue)}`
        );
        break;

      case "not":
        conditions.push(
          `${field} <> ${buildValue(operatorValue)}`
        );
        break;

      case "gt":
        conditions.push(
          `${field} > ${buildValue(operatorValue)}`
        );
        break;

      case "gte":
        conditions.push(
          `${field} >= ${buildValue(operatorValue)}`
        );
        break;

      case "lt":
        conditions.push(
          `${field} < ${buildValue(operatorValue)}`
        );
        break;

      case "lte":
        conditions.push(
          `${field} <= ${buildValue(operatorValue)}`
        );
        break;

      case "contains":
        conditions.push(
          `${field} LIKE '%' || ${buildValue(operatorValue)} || '%'`
        );
        break;

      case "startsWith":
        conditions.push(
          `${field} LIKE ${buildValue(operatorValue)} || '%'`
        );
        break;

      case "endsWith":
        conditions.push(
          `${field} LIKE '%' || ${buildValue(operatorValue)}`
        );
        break;

      case "in":
        conditions.push(
          `${field} IN (${operatorValue
            .map(buildValue)
            .join(", ")})`
        );
        break;

      case "notIn":
        conditions.push(
          `${field} NOT IN (${operatorValue
            .map(buildValue)
            .join(", ")})`
        );
        break;

      default:
        throw new Error(
          `Unsupported operator "${operator}"`
        );
    }
  }

  return conditions.join(" AND ");
}

/* ----------------------------
   WHERE BUILDER
---------------------------- */
export function buildWhere(
  where?: Record<string, any>,
): string {
  if (
    !where ||
    Object.keys(where).length === 0
  ) {
    return "";
  }

  // Handle AST ObjectExpression directly
  if (
    where.type === "ObjectExpression" &&
    Array.isArray(where.properties)
  ) {
    const converted: Record<string, any> = {};

    for (const prop of where.properties) {
      converted[prop.key.name] = prop.value;
    }

    where = converted;
  }

  const parts: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === "AND") {
      const sql = value
        .map(buildWhere)
        .map((x: string) =>
          x.replace(/^\s*WHERE\s+/i, "")
        )
        .join(" AND ");

      parts.push(`(${sql})`);
      continue;
    }

    if (key === "OR") {
      const sql = value
        .map(buildWhere)
        .map((x: string) =>
          x.replace(/^\s*WHERE\s+/i, "")
        )
        .join(" OR ");

      parts.push(`(${sql})`);
      continue;
    }

    if (key === "NOT") {
      const sql = buildWhere(value).replace(
        /^\s*WHERE\s+/i,
        "",
      );

      parts.push(`NOT (${sql})`);
      continue;
    }

    parts.push(
      buildFieldCondition(key, value),
    );
  }

  return parts.length
    ? ` WHERE ${parts.join(" AND ")}`
    : "";
}