import type {
  ExpressionNode,
  LiteralNode,
  IdentifierNode,
  MemberExpressionNode,
  CallExpressionNode,
  NewExpressionNode,
  ArrayExpressionNode,
  ObjectExpressionNode,
} from "../ast/expression";

export function buildExpression(node: ExpressionNode): string {
  if (!node || typeof node !== "object" || !("type" in node)) {
    throw new Error(`Invalid AST node: ${JSON.stringify(node)}`);
  }

  switch (node.type) {
    case "Literal":
      return buildLiteral(node);

    case "Identifier":
      return node.name;

    case "MemberExpression":
      return buildMember(node);

    case "CallExpression":
      return buildCall(node);

    case "NewExpression":
      return buildNew(node);

    case "ArrayExpression":
      return buildArray(node);

    // ⚠️ IMPORTANT: ObjectExpression is NOT a SQL expression anymore
    // We intentionally REMOVE it from expression builder
    default:
      throw new Error(`Unsupported expression type "${node.type}"`);
  }
}

/* ----------------- LITERALS ----------------- */

function buildLiteral(node: LiteralNode): string {
  if (node.value === null) return "NULL";

  if (typeof node.value === "number") {
    return node.value.toString();
  }

  if (typeof node.value === "boolean") {
    return node.value ? "TRUE" : "FALSE";
  }

  return `'${String(node.value).replace(/'/g, "''")}'`;
}

/* ----------------- MEMBER ----------------- */

function buildMember(node: MemberExpressionNode): string {
  return `${buildExpression(node.object)}.${node.property.name}`;
}

/* ----------------- CALL ----------------- */

function buildCall(node: CallExpressionNode): string {
  if (!node.callee) {
    throw new Error("CallExpression missing callee");
  }

  const callee = buildExpression(node.callee);

  switch (callee) {
    case "uuid":
      return "gen_random_uuid()";

    case "now":
      return "CURRENT_TIMESTAMP";

    default:
      return `${callee}(${(node.arguments || [])
        .map(buildExpression)
        .join(", ")})`;
  }
}

/* ----------------- NEW ----------------- */

function buildNew(node: NewExpressionNode): string {
  const callee = buildExpression(node.callee);

  switch (callee) {
    case "Date":
      return node.arguments.length === 0
        ? "CURRENT_TIMESTAMP"
        : buildExpression(node.arguments[0]);

    default:
      throw new Error(`Unsupported constructor "${callee}"`);
  }
}

/* ----------------- ARRAY ----------------- */

function buildArray(node: ArrayExpressionNode): string {
  return `(${node.elements.map(buildExpression).join(", ")})`;
}