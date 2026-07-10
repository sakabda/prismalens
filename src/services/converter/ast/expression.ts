/* ===========================================
 * Prisma Expression AST
 * =========================================== */

export type ExpressionNode =
  | IdentifierNode
  | LiteralNode
  | ObjectExpressionNode
  | PropertyNode
  | ArrayExpressionNode
  | MemberExpressionNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | CallExpressionNode;

/* =====================================================
 * Identifier
 * ===================================================== */

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

/* =====================================================
 * Literal
 * ===================================================== */

export interface LiteralNode {
  type: "Literal";
  value: unknown;
}

/* =====================================================
 * Object
 * ===================================================== */

export interface ObjectExpressionNode {
  type: "ObjectExpression";
  properties: PropertyNode[];
}

/* =====================================================
 * Property
 * ===================================================== */

export interface PropertyNode {
  type: "Property";
  key: IdentifierNode;
  value: ExpressionNode;
}

/* =====================================================
 * Array
 * ===================================================== */

export interface ArrayExpressionNode {
  type: "ArrayExpression";
  elements: ExpressionNode[];
}

/* =====================================================
 * Unary
 * ===================================================== */

export interface UnaryExpressionNode {
  type: "UnaryExpression";
  operator: string;
  argument: ExpressionNode;
}

/* =====================================================
 * Binary
 * ===================================================== */

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

/* =====================================================
 * Function Call
 * ===================================================== */

export interface CallExpressionNode {
  type: "CallExpression";
  callee: IdentifierNode;
  arguments: ExpressionNode[];
}

export interface MemberExpressionNode {
  type: "MemberExpression";

  object: ExpressionNode;

  property: IdentifierNode;
}