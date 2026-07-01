/** Supported Prisma operations */
export type PrismaOperation =
  | "findMany"
  | "findFirst"
  | "findUnique"
  | "create"
  | "createMany"
  | "update"
  | "updateMany"
  | "delete"
  | "deleteMany"
  | "upsert"
  | "aggregate"
  | "count"
  | "groupBy";

/** Supported Prisma filter operators */
export type FilterOperator =
  | "equals"
  | "not"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "mode"
  | "not"
  | "AND"
  | "OR"
  | "NOT"
  | "some"
  | "every"
  | "none"
  | "is"
  | "isNot"
  | "isEmpty"
  | "search";

/** Parsed filter condition */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | null | string[] | number[];
  negated?: boolean;
}

/** Logical filter group (AND / OR / NOT) */
export interface FilterGroup {
  type: "AND" | "OR" | "NOT";
  conditions: Array<FilterCondition | FilterGroup>;
}

/** Include / Select relation specification */
export interface RelationSpec {
  [relationName: string]: boolean | RelationSpec;
}

/** Order by specification */
export interface OrderBySpec {
  [fieldName: string]: "asc" | "desc" | OrderBySpec;
}

/** Full parsed Prisma query AST */
export interface ParsedPrismaQuery {
  model: string;
  operation: PrismaOperation;
  where?: FilterCondition | FilterGroup;
  data?: Record<string, unknown>;
  include?: RelationSpec;
  select?: RelationSpec;
  orderBy?: OrderBySpec | OrderBySpec[];
  take?: number;
  skip?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[];
  raw?: Record<string, unknown>;
}

/** Query analysis result */
export interface QueryAnalysis {
  score: number;
  maxScore: number;
  conditions: number;
  tables: number;
  joinCount: number;
  nestedRelationDepth: number;
  complexity: "Low" | "Medium" | "High" | "Very High";
  estimatedCost: "Low" | "Medium" | "High" | "Very High";
  querySize: number;
  hasSelect: boolean;
  hasPagination: boolean;
  hasOrderBy: boolean;
  bottlenecks: string[];
  warnings: string[];
}

/** Suggestion with severity */
export interface Suggestion {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  impact?: string;
}

/** History item */
export interface HistoryItem {
  id: string;
  prismaQuery: string;
  sqlQuery: string;
  mode: "prisma-to-sql" | "sql-to-prisma";
  analysis: QueryAnalysis | null;
  createdAt: string;
  favorited: boolean;
}

/** Snippet with tags and folder */
export interface Snippet {
  id: string;
  name: string;
  query: string;
  output?: string;
  tags: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
}

/** Query example */
export interface QueryExample {
  name: string;
  description: string;
  category: string;
  query: string;
}
