import { ASTBuilder } from "./ast-builder";
import { PrismaValidator } from "./validator";
import { SQLGenerator } from "./sql-generator";
import { PrismaGenerator } from "./prisma-generator";
import { QueryAnalyzer } from "./query-analyzer";
import type { PrismaQueryAST, Token } from "./types";

export class Converter {
  private validator = new PrismaValidator();
  private sqlGenerator = new SQLGenerator();
  private prismaGenerator = new PrismaGenerator();
  private analyzer = new QueryAnalyzer();

  /**
   * Prisma AST → SQL
   */
  toSQL(ast: PrismaQueryAST): string {
    const validation = this.validator.validate(ast);

    if (!validation.valid) {
      return this.formatErrors(validation.errors);
    }

    return this.sqlGenerator.generate(ast);
  }

  /**
   * Prisma AST → Prisma string
   */
  toPrisma(ast: PrismaQueryAST): string {
    const validation = this.validator.validate(ast);

    if (!validation.valid) {
      return this.formatErrors(validation.errors);
    }

    return this.prismaGenerator.generate(ast);
  }

  /**
   * Analyze Prisma AST
   */
  analyze(ast: PrismaQueryAST) {
    return this.analyzer.analyze(ast);
  }

  /**
   * Full pipeline (AST input)
   */
  process(ast: PrismaQueryAST) {
    const validation = this.validator.validate(ast);

    if (!validation.valid) {
      return {
        error: true,
        messages: validation.errors,
      };
    }

    return {
      sql: this.sqlGenerator.generate(ast),
      prisma: this.prismaGenerator.generate(ast),
      analysis: this.analyzer.analyze(ast),
    };
  }

  /**
   * Prisma string → SQL (full pipeline)
   */
  prismaToSQL(tokens: Token[]): string {
    const builder = new ASTBuilder(tokens);

    const ast = builder.build();

    if (!ast) {
      return "-- Invalid Prisma input";
    }

    const validation = this.validator.validate(ast);

    if (!validation.valid) {
      return this.formatErrors(validation.errors);
    }

    return this.sqlGenerator.generate(ast);
  }

  /**
   * Helper: format validation errors
   */
  private formatErrors(errors: string[]): string {
    return `-- Conversion failed:\n-- ${errors.join("\n-- ")}`;
  }
}