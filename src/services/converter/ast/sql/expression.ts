/**
 * SQL Expression AST
 *
 * Represents SQL expressions and values after planning.
 */

export type SqlExpression =
  | SqlIdentifier
  | SqlLiteral
  | SqlParameter
  | SqlBinaryExpression
  | SqlUnaryExpression
  | SqlFunctionCall
  | SqlArrayExpression
  | SqlRawExpression;

/* ===========================================
 * Identifier
 * =========================================== */

export interface SqlIdentifier {
  type: "Identifier";

  name: string;
}

/* ===========================================
 * Literal
 * =========================================== */

export interface SqlLiteral {
  type: "Literal";

  value: unknown;
}

/* ===========================================
 * Parameter
 * =========================================== */

export interface SqlParameter {
  type: "Parameter";

  /**
   * 1-based parameter index.
   *
   * PostgreSQL:
   *   $1
   *   $2
   *
   * MySQL / SQLite:
   *   ?
   *
   * SQL Server:
   *   @p1
   */
  index: number;
}

/* ===========================================
 * Binary Expression
 * =========================================== */

export interface SqlBinaryExpression {
  type: "BinaryExpression";

  operator: string;

  left: SqlExpression;

  right: SqlExpression;
}

/* ===========================================
 * Unary Expression
 * =========================================== */

export interface SqlUnaryExpression {
  type: "UnaryExpression";

  operator: string;

  argument: SqlExpression;
}

/* ===========================================
 * Function Call
 * =========================================== */

export interface SqlFunctionCall {
  type: "FunctionCall";

  name: string;

  arguments: SqlExpression[];
}

/* ===========================================
 * Array Expression
 * =========================================== */

export interface SqlArrayExpression {
  type: "ArrayExpression";

  elements: SqlExpression[];
}

/* ===========================================
 * Raw SQL
 * =========================================== */

export interface SqlRawExpression {
  type: "RawExpression";

  value: string;
}