import type { PrismaQueryAST } from "./types";
import { PrismaGenerator } from "./prisma-generator";
import { SQLGenerator } from "./sql-generator";

export class QueryFormatter {
  private prismaGenerator = new PrismaGenerator();
  private sqlGenerator = new SQLGenerator();

  /**
   * Format a Prisma AST into a nicely formatted Prisma query.
   */
  formatPrisma(ast: PrismaQueryAST): string {
    return this.prismaGenerator.generate(ast);
  }

  /**
   * Format a Prisma AST into SQL.
   */
  formatSQL(ast: PrismaQueryAST): string {
    return this.sqlGenerator.generate(ast);
  }

  /**
   * Format raw SQL by adding indentation and line breaks.
   */
  formatRawSQL(sql: string): string {
    return sql
      .replace(/\s+/g, " ")
      .replace(/\bSELECT\b/gi, "SELECT")
      .replace(/\bFROM\b/gi, "\nFROM")
      .replace(/\bWHERE\b/gi, "\nWHERE")
      .replace(/\bGROUP BY\b/gi, "\nGROUP BY")
      .replace(/\bHAVING\b/gi, "\nHAVING")
      .replace(/\bORDER BY\b/gi, "\nORDER BY")
      .replace(/\bLIMIT\b/gi, "\nLIMIT")
      .replace(/\bOFFSET\b/gi, "\nOFFSET")
      .replace(/\bINNER JOIN\b/gi, "\nINNER JOIN")
      .replace(/\bLEFT JOIN\b/gi, "\nLEFT JOIN")
      .replace(/\bRIGHT JOIN\b/gi, "\nRIGHT JOIN")
      .replace(/\bVALUES\b/gi, "\nVALUES")
      .trim();
  }

  /**
   * Compact SQL (single line).
   */
  compactSQL(sql: string): string {
    return sql.replace(/\s+/g, " ").trim();
  }

  /**
   * Compact Prisma query.
   */
  compactPrisma(ast: PrismaQueryAST): string {
    return this.formatPrisma(ast)
      .replace(/\n/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}