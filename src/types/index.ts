export type { PrismaQueryAST, PrismaOperation } from "../services/converter/types";

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



export type { ThemeValue as Theme } from "./ui.types";

export type ConverterMode = "prisma-to-sql" | "sql-to-prisma";

export type BottomTab = "analysis" | "suggestions" | "ast";
