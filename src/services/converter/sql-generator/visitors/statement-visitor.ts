import type {
  SqlStatement,
  SqlSelectStatement,
  SqlSelectColumn,
  SqlInsertStatement,
  SqlUpdateStatement,
  SqlDeleteStatement,
  SqlOrderBy,
} from "../../ast/sql";

import type {
  GeneratorContext,
} from "../types";

import { ExpressionVisitor } from "./expression-visitor";

export class StatementVisitor {
  private readonly expressionVisitor: ExpressionVisitor;

  constructor(
    private readonly context: GeneratorContext,
  ) {
    this.expressionVisitor =
      new ExpressionVisitor(
        context,
      );
  }

  visit(
    statement: SqlStatement,
  ): string {
    switch (statement.type) {
      case "SelectStatement":
        return this.visitSelect(
          statement,
        );

      case "InsertStatement":
        return this.visitInsert(
          statement,
        );

      case "UpdateStatement":
        return this.visitUpdate(
          statement,
        );

      case "DeleteStatement":
        return this.visitDelete(
          statement,
        );

      default:
        throw new Error(
          `Unsupported SQL statement type: ${
            (statement as any).type
          }`,
        );
    }
  }

  private visitSelect(
    statement: SqlSelectStatement,
  ): string {
    const columns =
      statement.columns.length
        ? statement.columns
            .map(column =>
              this.visitSelectColumn(
                column,
              ),
            )
            .join(", ")
        : "*";

    let sql =
      `SELECT ${columns} FROM ${
        this.context.dialect.quoteIdentifier(
          statement.table,
        )
      }`;

    if (statement.where) {
      sql +=
        ` WHERE ${
          this.expressionVisitor.visit(
            statement.where,
          )
        }`;
    }

    if (statement.orderBy?.length) {
      sql +=
        ` ORDER BY ${
          this.visitOrderBy(
            statement.orderBy,
          )
        }`;
    }

    if (statement.limit !== undefined) {
      sql +=
        ` ${
          this.context.dialect.limit(
            statement.limit,
          )
        }`;
    }

    return sql;
  }

  private visitInsert(
    statement: SqlInsertStatement,
  ): string {
    const columns =
      statement.columns
        .map(column =>
          this.context.dialect.quoteIdentifier(
            column,
          ),
        )
        .join(", ");

    const values =
      statement.values
        .map(value =>
          this.expressionVisitor.visit(
            value,
          ),
        )
        .join(", ");

    return (
      `INSERT INTO ${
        this.context.dialect.quoteIdentifier(
          statement.table,
        )
      } (${columns}) VALUES (${values})`
    );
  }

  private visitUpdate(
    statement: SqlUpdateStatement,
  ): string {
    const sets =
      Object.entries(
        statement.values,
      )
        .map(
          ([column, value]) =>
            `${
              this.context.dialect.quoteIdentifier(
                column,
              )
            } = ${
              this.expressionVisitor.visit(
                value,
              )
            }`,
        )
        .join(", ");

    let sql =
      `UPDATE ${
        this.context.dialect.quoteIdentifier(
          statement.table,
        )
      } SET ${sets}`;

    if (statement.where) {
      sql +=
        ` WHERE ${
          this.expressionVisitor.visit(
            statement.where,
          )
        }`;
    }

    return sql;
  }

  private visitDelete(
    statement: SqlDeleteStatement,
  ): string {
    let sql =
      `DELETE FROM ${
        this.context.dialect.quoteIdentifier(
          statement.table,
        )
      }`;

    if (statement.where) {
      sql +=
        ` WHERE ${
          this.expressionVisitor.visit(
            statement.where,
          )
        }`;
    }

    return sql;
  }

  private visitSelectColumn(
    column: SqlSelectColumn,
  ): string {
    const name =
      column.name === "*"
        ? "*"
        : this.context.dialect.quoteIdentifier(
            column.name,
          );

    if (!column.alias) {
      return name;
    }

    return `${name} AS ${this.context.dialect.quoteIdentifier(
      column.alias,
    )}`;
  }

  private visitOrderBy(
    orderBy: SqlOrderBy[],
  ): string {
    return orderBy
      .map(item => {
        const direction =
          item.direction ?? "ASC";

        return `${
          this.context.dialect.quoteIdentifier(
            item.column,
          )
        } ${direction}`;
      })
      .join(", ");
  }
}