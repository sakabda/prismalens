export interface SQLSelectAST {
  type: "SELECT";

  table: string;

  columns: SQLColumn[];

  joins: SQLJoin[];

  where?: SQLExpression;

  groupBy: string[];

  having?: SQLExpression;

  orderBy: SQLOrder[];

  limit?: number;

  offset?: number;

  distinct?: boolean;
}

export interface SQLInsertAST {
  type: "INSERT";

  table: string;

  columns: string[];

  values: SQLExpression[][];
}

export interface SQLUpdateAST {
  type: "UPDATE";

  table: string;

  set: Record<string, SQLExpression>;

  where?: SQLExpression;
}

export interface SQLDeleteAST {
  type: "DELETE";

  table: string;

  where?: SQLExpression;
}

export type SQLAST =
  | SQLSelectAST
  | SQLInsertAST
  | SQLUpdateAST
  | SQLDeleteAST;

export interface SQLColumn {
  expression: string;

  alias?: string;
}

export interface SQLJoin {
  type: "INNER" | "LEFT";

  table: string;

  alias?: string;

  on: SQLExpression;
}

export interface SQLOrder {
  field: string;

  direction: "ASC" | "DESC";
}

/* ===========================
   SQL Expressions
=========================== */

export type SQLExpression =
  | SQLLiteral
  | SQLColumnRef
  | SQLBinary
  | SQLFunction;

export interface SQLLiteral {
  type: "literal";

  value: unknown;
}

export interface SQLColumnRef {
  type: "column";

  name: string;
}

export interface SQLBinary {
  type: "binary";

  left: SQLExpression;

  operator: string;

  right: SQLExpression;
}

export interface SQLFunction {
  type: "function";

  name: string;

  args: SQLExpression[];
}