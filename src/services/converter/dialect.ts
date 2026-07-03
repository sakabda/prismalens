// ============================================
// SQL Dialect Configuration
// ============================================

export type SQLDialect =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "sqlserver"
  | "cockroachdb";

export type LimitStyle =
  | "LIMIT_OFFSET"
  | "TOP"
  | "FETCH_NEXT";

export interface DialectConfig {
  /** Name for display */
  name: string;

  /** Character(s) used to quote identifiers */
  identifierQuote: string;

  /** How booleans are represented */
  booleanTrue: string;
  booleanFalse: string;

  /** Pagination syntax style */
  limitStyle: LimitStyle;

  /** Default schema prefix (e.g. "public" for PG) */
  defaultSchema: string;

  /** Supports ILIKE natively */
  supportsILike: boolean;

  /** Supports RETURNING clause */
  supportsReturning: boolean;

  /** Supports ON CONFLICT (upsert) */
  supportsOnConflict: boolean;

  /** Supports DISTINCT ON */
  supportsDistinctOn: boolean;

  /** String concatenation operator */
  concatOperator: string;
}

// ============================================
// Dialect Configurations
// ============================================

const POSTGRESQL: DialectConfig = {
  name: "PostgreSQL",
  identifierQuote: '"',
  booleanTrue: "TRUE",
  booleanFalse: "FALSE",
  limitStyle: "LIMIT_OFFSET",
  defaultSchema: "public",
  supportsILike: true,
  supportsReturning: true,
  supportsOnConflict: true,
  supportsDistinctOn: true,
  concatOperator: "||",
};

const MYSQL: DialectConfig = {
  name: "MySQL",
  identifierQuote: "`",
  booleanTrue: "TRUE",
  booleanFalse: "FALSE",
  limitStyle: "LIMIT_OFFSET",
  defaultSchema: "",
  supportsILike: false,
  supportsReturning: false,
  supportsOnConflict: false,
  supportsDistinctOn: false,
  concatOperator: "||",
};

const SQLITE: DialectConfig = {
  name: "SQLite",
  identifierQuote: '"',
  booleanTrue: "1",
  booleanFalse: "0",
  limitStyle: "LIMIT_OFFSET",
  defaultSchema: "",
  supportsILike: false,
  supportsReturning: true,
  supportsOnConflict: true,
  supportsDistinctOn: false,
  concatOperator: "||",
};

const SQLSERVER: DialectConfig = {
  name: "SQL Server",
  identifierQuote: "[",
  booleanTrue: "1",
  booleanFalse: "0",
  limitStyle: "FETCH_NEXT",
  defaultSchema: "dbo",
  supportsILike: false,
  supportsReturning: false,
  supportsOnConflict: false,
  supportsDistinctOn: false,
  concatOperator: "+",
};

const COCKROACHDB: DialectConfig = {
  name: "CockroachDB",
  identifierQuote: '"',
  booleanTrue: "TRUE",
  booleanFalse: "FALSE",
  limitStyle: "LIMIT_OFFSET",
  defaultSchema: "public",
  supportsILike: true,
  supportsReturning: true,
  supportsOnConflict: true,
  supportsDistinctOn: true,
  concatOperator: "||",
};

// ============================================
// Registry
// ============================================

const DIALECT_MAP: Record<SQLDialect, DialectConfig> = {
  postgresql: POSTGRESQL,
  mysql: MYSQL,
  sqlite: SQLITE,
  sqlserver: SQLSERVER,
  cockroachdb: COCKROACHDB,
};

export function getDialectConfig(
  dialect: SQLDialect,
): DialectConfig {
  return DIALECT_MAP[dialect];
}

export function getAllDialects(): SQLDialect[] {
  return Object.keys(DIALECT_MAP) as SQLDialect[];
}

/** Default dialect for PrismaLens */
export const DEFAULT_DIALECT: SQLDialect = "postgresql";
