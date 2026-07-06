/* ==========================================
 * Expression AST
 * ========================================== */

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

export interface LiteralNode {
  type: "Literal";
  value:
    | string
    | number
    | boolean
    | null;
}

export interface ObjectExpressionNode {
  type: "ObjectExpression";
  properties: PropertyNode[];
}

export interface PropertyNode {
  type: "Property";
  key: IdentifierNode;
  value: ExpressionNode;
}

export interface ArrayExpressionNode {
  type: "ArrayExpression";
  elements: ExpressionNode[];
}

export interface MemberExpressionNode {
  type: "MemberExpression";

  object: ExpressionNode;

  property: IdentifierNode;
}

export interface CallExpressionNode {
  type: "CallExpression";

  callee: ExpressionNode;

  arguments: ExpressionNode[];
}

export interface NewExpressionNode {
  type: "NewExpression";

  callee: ExpressionNode;

  arguments: ExpressionNode[];
}

export type ExpressionNode =
  | IdentifierNode
  | LiteralNode
  | ObjectExpressionNode
  | ArrayExpressionNode
  | MemberExpressionNode
  | CallExpressionNode
  | NewExpressionNode;