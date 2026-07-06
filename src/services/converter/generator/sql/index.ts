import type {
  SQLAST,
  SQLExpression,
} from "../../sql-ast/types";

export class SQLASTGenerator {
  generate(ast: SQLAST): string {
    switch (ast.type) {
      case "SELECT":
        return this.generateSelect(ast);

      default:
        throw new Error("Unsupported SQL AST");
    }
  }

  private generateSelect(ast: any): string {
    let sql = "SELECT ";

    sql += ast.columns
      .map((c: any) => c.expression)
      .join(", ");

    sql += ` FROM ${ast.table}`;

    if (ast.limit !== undefined) {
      sql += ` LIMIT ${ast.limit}`;
    }

    if (ast.offset !== undefined) {
      sql += ` OFFSET ${ast.offset}`;
    }

    return sql + ";";
  }

  private expression(exp: SQLExpression): string {
    switch (exp.type) {
      case "literal":
        return JSON.stringify(exp.value);

      case "column":
        return exp.name;

      case "binary":
        return `${this.expression(exp.left)} ${exp.operator} ${this.expression(exp.right)}`;

      case "function":
        return `${exp.name}(${exp.args
          .map((a) => this.expression(a))
          .join(", ")})`;
    }
  }
}