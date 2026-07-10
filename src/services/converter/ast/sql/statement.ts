import type {
  SqlExpression,
} from "./expression";

/* ===========================================
 * SQL AST Statements
 * =========================================== */

export type SqlNode =
  | SqlStatement
  | SqlExpression;

export type SqlStatement =
  | SqlSelectStatement
  | SqlInsertStatement
  | SqlUpdateStatement
  | SqlDeleteStatement;

/* ===========================================
 * SELECT
 * =========================================== */

export interface SqlSelectStatement {
  type: "SelectStatement";

  table: string;

  columns: SqlSelectColumn[];

  where?: SqlExpression;

  joins?: SqlJoin[];

  orderBy?: SqlOrderBy[];

  groupBy?: string[];

  having?: SqlExpression;

  distinct?: boolean;

  limit?: number;

  offset?: number;
}

export interface SqlSelectColumn {
  name: string;

  alias?: string;
}

export interface SqlOrderBy {
  column: string;

  direction: "ASC" | "DESC";
}

export interface SqlJoin {
  type: "INNER" | "LEFT" | "RIGHT" | "FULL";

  table: string;

  alias?: string;

  on: SqlExpression;
}

/* ===========================================
 * INSERT
 * =========================================== */

export interface SqlInsertStatement {
  type: "InsertStatement";

  table: string;

  columns: string[];

  values: SqlExpression[];
}

/* ===========================================
 * UPDATE
 * =========================================== */

export interface SqlUpdateStatement {
  type: "UpdateStatement";

  table: string;

  values: Record<
    string,
    SqlExpression
  >;

  where?: SqlExpression;
}

/* ===========================================
 * DELETE
 * =========================================== */

export interface SqlDeleteStatement {
  type: "DeleteStatement";

  table: string;

  where?: SqlExpression;
}