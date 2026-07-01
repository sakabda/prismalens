export interface PrismaQueryAST {
  model: string;
  operation: PrismaOperation;
  args: Record<string, unknown>;
}

export const PRISMA_OPERATIONS = {
  FIND_MANY: "findMany",
  FIND_FIRST: "findFirst",
  FIND_UNIQUE: "findUnique",
  CREATE: "create",
  CREATE_MANY: "createMany",
  UPDATE: "update",
  UPDATE_MANY: "updateMany",
  DELETE: "delete",
  DELETE_MANY: "deleteMany",
  UPSERT: "upsert",
  AGGREGATE: "aggregate",
  COUNT: "count",
  GROUP_BY: "groupBy",
} as const;

export type PrismaOperation =
  (typeof PRISMA_OPERATIONS)[keyof typeof PRISMA_OPERATIONS];

export interface QueryAnalysis {
  score: number;
  conditions: number;
  tables: number;
  joins: number;
  complexity: "Low" | "Medium" | "High" | "Very High";
  nestedDepth: number;
  estimatedCost: "Low" | "Medium" | "High";
  warnings: string[];
  bottlenecks: string[];
}

export interface HistoryItem {
  id: string;
  prismaQuery: string;
  sqlQuery: string;
  mode: "prisma-to-sql" | "sql-to-prisma";
  analysis: QueryAnalysis | null;
  createdAt: string;
}

export interface Snippet {
  id: string;
  name: string;
  query: string;
  mode: "prisma-to-sql" | "sql-to-prisma";
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface QueryExample {
  name: string;
  category: string;
  query: string;
  description: string;
}

export type ConverterMode = "prisma-to-sql" | "sql-to-prisma";

export type BottomTab = "analysis" | "suggestions" | "ast";
