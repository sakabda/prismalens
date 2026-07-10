import type {
  SqlNode,
  SqlStatement,
  SqlSelectStatement,
  SqlInsertStatement,
  SqlUpdateStatement,
  SqlDeleteStatement,
} from "../ast/sql";


import type {
  SqlExpression,
} from "../ast/sql/expression";



export class SQLFormatter {


  format(
    ast: SqlNode,
  ): string {


    if (!this.isStatement(ast)) {

      throw new Error(
        "SQLFormatter received an expression instead of a SQL statement.",
      );

    }


    const statement: SqlStatement = ast;



    switch(statement.type) {


      case "SelectStatement":

        return this.formatSelect(
          statement,
        );


      case "InsertStatement":

        return this.formatInsert(
          statement,
        );


      case "UpdateStatement":

        return this.formatUpdate(
          statement,
        );


      case "DeleteStatement":

        return this.formatDelete(
          statement,
        );


      default:

        throw new Error(
          "Unsupported SQL statement.",
        );

    }

  }





  private isStatement(
    node: SqlNode,
  ): node is SqlStatement {

    return (
      node.type === "SelectStatement" ||
      node.type === "InsertStatement" ||
      node.type === "UpdateStatement" ||
      node.type === "DeleteStatement"
    );

  }





  private formatSelect(
    ast: SqlSelectStatement,
  ): string {


    const sql:string[] = [];


    sql.push(
      `SELECT ${
        ast.columns.length
          ? ast.columns.join(", ")
          : "*"
      }`,
    );


    sql.push(
      `FROM ${ast.table}`,
    );


    if(ast.where) {

      sql.push(
        `WHERE ${this.expr(ast.where)}`,
      );

    }


    if(ast.orderBy?.length) {

      sql.push(
        `ORDER BY ${
          ast.orderBy
            .map(
              order =>
                `${order.column} ${
                  order.direction ?? "ASC"
                }`,
            )
            .join(", ")
        }`,
      );

    }


    if(ast.limit !== undefined) {

      sql.push(
        `LIMIT ${ast.limit}`,
      );

    }


    return sql.join("\n") + ";";

  }





  private formatInsert(
    ast: SqlInsertStatement,
  ): string {


    return `
INSERT INTO ${ast.table}
(${ast.columns.join(", ")})
VALUES
(
${ast.values
  .map(value => this.expr(value))
  .join(",\n")}
);
`.trim();

  }





  private formatUpdate(
    ast: SqlUpdateStatement,
  ): string {


    const set =
      Object.entries(ast.values)
        .map(
          ([key,value]) =>
            `${key} = ${this.expr(value)}`,
        )
        .join(", ");



    return `
UPDATE ${ast.table}
SET ${set}
${
  ast.where
    ? `WHERE ${this.expr(ast.where)}`
    : ""
};
`.trim();

  }





  private formatDelete(
    ast: SqlDeleteStatement,
  ): string {


    return `
DELETE FROM ${ast.table}
${
  ast.where
    ? `WHERE ${this.expr(ast.where)}`
    : ""
};
`.trim();

  }





  private expr(
    node: SqlExpression,
  ): string {


    switch(node.type) {


      case "Literal":

        return this.literal(node.value);



      case "Identifier":

        return node.name;



      case "BinaryExpression":

        return (
          `${this.expr(node.left)} ` +
          `${node.operator} ` +
          `${this.expr(node.right)}`
        );



      case "FunctionCall":

        return (
          `${node.name}(${
            node.arguments
              .map(arg => this.expr(arg))
              .join(", ")
          })`
        );



      case "ArrayExpression":

        return (
          "(" +
          node.elements
            .map(item => this.expr(item))
            .join(", ") +
          ")"
        );



      case "RawExpression":

        return node.value;


      default:

        throw new Error(
          `Unsupported expression ${node.type}`,
        );

    }

  }





  private literal(
    value: unknown,
  ): string {


    if(value === null) {

      return "NULL";

    }


    if(typeof value === "number") {

      return String(value);

    }


    if(typeof value === "boolean") {

      return value
        ? "TRUE"
        : "FALSE";

    }


    return `'${
      String(value)
        .replace(/'/g, "''")
    }'`;

  }

}