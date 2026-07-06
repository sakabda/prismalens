import type { ExpressionNode } from "../../ast/expression";
import type { QueryPlan } from "../../planner/types";
import type {
  SQLAST,
  SQLDeleteAST,
  SQLExpression,
  SQLFunction,
  SQLInsertAST,
  SQLLiteral,
  SQLSelectAST,
  SQLUpdateAST,
} from "../../sql-ast/types";

export class PlannerToSQLAST {
   build(plan: QueryPlan): SQLAST {
    switch (plan.operation) {
      case "SELECT":
        return this.buildSelect(plan);

      case "INSERT":
        return this.buildInsert(plan);

      case "UPDATE":
        return this.buildUpdate(plan);

      case "DELETE":
        return this.buildDelete(plan);

      default:
        throw new Error(
          `Unsupported planner operation ${plan.operation}`,
        );
    }
   }
  
  private buildInsert(
  plan: QueryPlan,
): SQLInsertAST {

  const rows = plan.insert?.rows ?? [];

  if (!rows.length) {
    throw new Error("No rows.");
  }

  const columns = Object.keys(rows[0]);

  return {

    type: "INSERT",

    table: plan.table,

    columns,

    values: rows.map((row) =>
      columns.map((column) =>
        this.toExpression(row[column]),
      ),
    ),

  };

  }
  
  private buildUpdate(
  plan: QueryPlan,
): SQLUpdateAST {

  const values = plan.update?.values ?? {};

  const set: Record<string, any> = {};

  for (const key of Object.keys(values)) {

    set[key] =
      this.toExpression(values[key]);

  }

  return {

    type: "UPDATE",

    table: plan.table,

    set,

    where: undefined,

  };

  }
  
  private buildDelete(
  plan: QueryPlan,
): SQLDeleteAST {

  return {

    type: "DELETE",

    table: plan.table,

    where: undefined,

  };

  }
  
private toExpression(value: unknown): SQLExpression {
  if (
    value &&
    typeof value === "object" &&
    "type" in (value as any)
  ) {
    const node = value as any;

    switch (node.type) {
      case "Literal":
        const literal: SQLLiteral = {
          type: "literal",
          value: node.value,
        };
        return literal;

      case "CallExpression":
        const fn: SQLFunction = {
          type: "function",
          name: this.getFunctionName(node.callee),
          args: [],
        };
        return fn;
    }
  }

  return {
    type: "literal",
    value,
  };
}

  private buildSelect(
    plan: QueryPlan,
  ): SQLSelectAST {
    return {
      type: "SELECT",

      table: plan.table,

      columns: plan.select.columns,

      joins: [],

      where: undefined,

      groupBy: [],

      having: undefined,

      orderBy: [],

      limit: plan.select.limit,

      offset: plan.select.offset,

      distinct: false,
    };
  }

  private getFunctionName(
  callee: ExpressionNode,
): string {
  switch (callee.type) {
    case "Identifier":
      return callee.name;

    case "MemberExpression":
      return (
        this.getFunctionName(callee.object) +
        "." +
        callee.property.name
      );

    default:
      throw new Error(
        `Unsupported function callee: ${callee.type}`,
      );
  }
}
}