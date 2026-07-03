import type {
  PrismaOperator,
  PrismaQueryAST,
  PrismaWhere,
} from "./types";

export class SQLGenerator {
  generate(ast: PrismaQueryAST): string {
    switch (ast.operation) {
      case "findMany":
        return this.generateFindMany(ast);

      case "findFirst":
        return this.generateFindFirst(ast);

      case "findUnique":
      case "findUniqueOrThrow":
      case "findFirstOrThrow":
        return this.generateFindUnique(ast);

      case "count":
        return this.generateCount(ast);

      default:
        throw new Error(
          `Operation "${ast.operation}" is not supported yet.`,
        );
    }
  }

  // -------------------------------------------------------
  // SELECT *
  // -------------------------------------------------------

  private generateFindMany(ast: PrismaQueryAST): string {
    const sql: string[] = [];

    sql.push(this.buildSelect(ast));
    sql.push(`FROM ${ast.model}`);

    const where = this.buildWhere(ast.args.where);

    if (where) {
      sql.push(where);
    }

    const orderBy = this.buildOrderBy(ast.args.orderBy);

    if (orderBy) {
      sql.push(orderBy);
    }

    if (typeof ast.args.take === "number") {
      sql.push(`LIMIT ${ast.args.take}`);
    }

    if (typeof ast.args.skip === "number") {
      sql.push(`OFFSET ${ast.args.skip}`);
    }

    return sql.join("\n") + ";";
  }

  // -------------------------------------------------------

  private generateFindFirst(ast: PrismaQueryAST): string {
    const copy: PrismaQueryAST = {
      ...ast,
      args: {
        ...ast.args,
        take: 1,
      },
    };

    return this.generateFindMany(copy);
  }

  // -------------------------------------------------------

  private generateFindUnique(ast: PrismaQueryAST): string {
    const copy: PrismaQueryAST = {
      ...ast,
      args: {
        ...ast.args,
        take: 1,
      },
    };

    return this.generateFindMany(copy);
  }

  // -------------------------------------------------------

  private generateCount(ast: PrismaQueryAST): string {
    const sql: string[] = [];

    sql.push("SELECT COUNT(*)");

    sql.push(`FROM ${ast.model}`);

    const where = this.buildWhere(ast.args.where);

    if (where) {
      sql.push(where);
    }

    return sql.join("\n") + ";";
  }

  // -------------------------------------------------------

  private buildSelect(ast: PrismaQueryAST): string {
    if (!ast.args.select) {
      return "SELECT *";
    }

    const columns = Object.entries(ast.args.select)
      .filter(([, value]) => value)
      .map(([key]) => key);

    if (!columns.length) {
      return "SELECT *";
    }

    return `SELECT ${columns.join(", ")}`;
  }

  // -------------------------------------------------------

  private buildOrderBy(orderBy: any): string {
    if (!orderBy) {
      return "";
    }

    const items = Array.isArray(orderBy)
      ? orderBy
      : [orderBy];

    const result: string[] = [];

    for (const item of items) {
      for (const [field, direction] of Object.entries(item)) {
        result.push(
          `${field} ${String(direction).toUpperCase()}`,
        );
      }
    }

    if (!result.length) {
      return "";
    }

    return `ORDER BY ${result.join(", ")}`;
  }

  // -------------------------------------------------------

  private buildWhere(where?: PrismaWhere): string {
    if (!where) {
      return "";
    }

    const conditions = this.parseWhere(where);

    if (!conditions.length) {
      return "";
    }

    return `WHERE ${conditions.join(" AND ")}`;
  }

  // -------------------------------------------------------

  private parseWhere(where: PrismaWhere): string[] {
    const result: string[] = [];

    for (const [field, value] of Object.entries(where)) {
      if (
        field === "AND" ||
        field === "OR" ||
        field === "NOT"
      ) {
        continue;
      }

      if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        result.push(
          `${field} = ${this.sqlValue(value)}`,
        );
        continue;
      }

      result.push(
        this.parseOperator(
          field,
          value as PrismaOperator,
        ),
      );
    }

    return result;
  }

  // -------------------------------------------------------

  private parseOperator(
    field: string,
    op: PrismaOperator,
  ): string {
    if (op.equals !== undefined)
      return `${field} = ${this.sqlValue(op.equals)}`;

    if (op.gt !== undefined)
      return `${field} > ${op.gt}`;

    if (op.gte !== undefined)
      return `${field} >= ${op.gte}`;

    if (op.lt !== undefined)
      return `${field} < ${op.lt}`;

    if (op.lte !== undefined)
      return `${field} <= ${op.lte}`;

    if (op.contains !== undefined)
      return `${field} LIKE '%${op.contains}%'`;

    if (op.startsWith !== undefined)
      return `${field} LIKE '${op.startsWith}%'`;

    if (op.endsWith !== undefined)
      return `${field} LIKE '%${op.endsWith}'`;

    if (op.in?.length)
      return `${field} IN (${op.in
        .map((v) => this.sqlValue(v))
        .join(", ")})`;

    if (op.notIn?.length)
      return `${field} NOT IN (${op.notIn
        .map((v) => this.sqlValue(v))
        .join(", ")})`;

    return "";
  }

  // -------------------------------------------------------

  private sqlValue(value: unknown): string {
    if (value === null) {
      return "NULL";
    }

    switch (typeof value) {
      case "number":
        return String(value);

      case "boolean":
        return value ? "TRUE" : "FALSE";

      default:
        return `'${String(value)}'`;
    }
  }
}