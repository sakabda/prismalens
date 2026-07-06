import type {
  SelectStatementNode,
  ConditionNode,
} from "../sql-ast";

export class SqlFormatter {
  format(
    statement: SelectStatementNode,
  ): string {
    const lines: string[] = [];

    lines.push(
      this.formatSelect(statement),
    );

    lines.push(
      this.formatFrom(statement),
    );

    if (statement.joins.length) {
      lines.push(
        this.formatJoins(statement),
      );
    }

    if (statement.where) {
      lines.push(
        this.formatWhere(statement),
      );
    }

    if (statement.groupBy) {
      lines.push(
        this.formatGroupBy(statement),
      );
    }

    if (statement.orderBy) {
      lines.push(
        this.formatOrderBy(statement),
      );
    }

    if (statement.limit) {
      lines.push(
        `LIMIT ${statement.limit.value}`,
      );
    }

    if (statement.offset) {
      lines.push(
        `OFFSET ${statement.offset.value}`,
      );
    }

    return lines.join("\n") + ";";
  }

  private formatSelect(
    statement: SelectStatementNode,
  ): string {
    if (
      statement.projection.includeAll
    ) {
      return "SELECT *";
    }

    return `SELECT ${statement.projection.fields.join(", ")}`;
  }

  private formatFrom(
    statement: SelectStatementNode,
  ): string {
    return `FROM ${statement.from.table}`;
  }

  private formatJoins(
    statement: SelectStatementNode,
  ): string {
    return statement.joins
      .map(
        (join) =>
          `${join.type} JOIN ${join.table}
ON ${join.on.left} = ${join.on.right}`,
      )
      .join("\n");
  }

  private formatWhere(
    statement: SelectStatementNode,
  ): string {
    return `WHERE ${statement.where.conditions
      .map(this.formatCondition)
      .join(" AND ")}`;
  }

  private formatCondition(
    condition: ConditionNode,
  ): string {
    return `${condition.field} ${condition.operator} ${this.quote(condition.value)}`;
  }

  private formatGroupBy(
    statement: SelectStatementNode,
  ): string {
    return `GROUP BY ${statement.groupBy.fields.join(", ")}`;
  }

  private formatOrderBy(
    statement: SelectStatementNode,
  ): string {
    return `ORDER BY ${statement.orderBy.fields
      .map(
        (field) =>
          `${field.field} ${field.direction}`,
      )
      .join(", ")}`;
  }

  private quote(
    value: unknown,
  ): string {
    if (value === null) {
      return "NULL";
    }

    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "boolean") {
      return value
        ? "TRUE"
        : "FALSE";
    }

    return `'${String(value).replace(/'/g, "''")}'`;
  }
}