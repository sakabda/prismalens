
import type {
  QueryNode,
  SelectNode,
  DataNode,
  IncludeNode,
  OrderByNode,
  WhereNode,
} from "../ast/prisma";

import type {
  QueryPlan,
  ColumnPlan,
  JoinPlan,
  OrderPlan,
} from "./types";

export class QueryPlanner {
  build(ast: QueryNode): QueryPlan {
    switch (ast.operation) {
      case "findMany":
      case "findFirst":
      case "findUnique":
      case "findUniqueOrThrow":
      case "findFirstOrThrow":
        return this.buildSelectPlan(ast);

      case "create":
      case "createMany":
        return this.buildInsertPlan(ast);

      case "update":
      case "updateMany":
        return this.buildUpdatePlan(ast);

      case "delete":
      case "deleteMany":
        return this.buildDeletePlan(ast);

      default:
        throw new Error(
          `Planner does not support "${ast.operation}" yet.`,
        );
    }
  }

private buildSelectPlan(ast: QueryNode): QueryPlan {
  return {
    operation: "SELECT",

    table: ast.model,

   select: {

    columns: this.buildColumns(ast.args.select),

    joins: this.buildJoins(ast.args.include),

    where: this.buildWhere(ast.args.where),

    orderBy: this.buildOrderBy(ast.args.orderBy),

    groupBy: this.buildGroupBy(ast.args.by),

    having: this.buildHaving(ast.args.having),

    limit: ast.args.take,

    offset: ast.args.skip,

    distinct: this.buildDistinct(ast.args.distinct),

}
  };
}

  /* =======================================
      INSERT
     ======================================= */

  private buildInsertPlan(ast: QueryNode): QueryPlan {
    const rows =
      Array.isArray(ast.args.data)
        ? ast.args.data.map((row) =>
            this.objectExpressionToRecord(row),
          )
        : ast.args.data
        ? [this.objectExpressionToRecord(ast.args.data)]
        : [];

    return {
      operation: "INSERT",

      table: ast.model,

      insert: {
        rows,
      },
    };
  }
 

 /* =======================================
    UPDATE
======================================= */

private buildUpdatePlan(ast: QueryNode): QueryPlan {
  return {
    operation: "UPDATE",

    table: ast.model,

    update: {
      values:
        ast.args.data && !Array.isArray(ast.args.data)
          ? this.objectExpressionToRecord(ast.args.data)
          : {},

      where: ast.args.where,
    },
  };
}

/* =======================================
    DELETE
======================================= */

private buildDeletePlan(ast: QueryNode): QueryPlan {
  return {
    operation: "DELETE",

    table: ast.model,

    delete: {
      where: ast.args.where,
    },
  };
}

  /* =======================================
      SELECT COLUMNS
     ======================================= */

  private buildColumns(
    select?: SelectNode,
  ): ColumnPlan[] {
    if (!select) {
      return [
        {
          expression: "*",
        },
      ];
    }

    return this.extractSelectedFields(select).map(
      (field) => ({
        expression: field,
      }),
    );
  }

  private extractSelectedFields(
    select: SelectNode,
  ): string[] {
    return select.properties
      .filter(
        (property) =>
          property.value.type === "Literal" &&
          property.value.value === true,
      )
      .map((property) => property.key.name);
  }

  /* =======================================
      AST -> Plain Object
     ======================================= */

  private objectExpressionToRecord(
    node: DataNode,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const property of node.properties) {
      const key = property.key.name;
      const value = property.value;

      switch (value.type) {
        case "Literal":
          result[key] = value.value;
          break;

        case "ObjectExpression":
          result[key] =
            this.objectExpressionToRecord(
              value as DataNode,
            );
          break;

        case "ArrayExpression":
          result[key] = value.elements.map((element) => {
            if (element.type === "Literal") {
              return element.value;
            }

            if (element.type === "ObjectExpression") {
              return this.objectExpressionToRecord(
                element as DataNode,
              );
            }

            return element;
          });
          break;

        default:
          // CallExpression, Identifier,
          // MemberExpression, NewExpression...
          result[key] = value;
      }
    }

    return result;
  }

private buildOrderBy(
  order?: OrderByNode | OrderByNode[],
): OrderPlan[] {

  if (!order) {
    return [];
  }

  const orders = Array.isArray(order)
    ? order
    : [order];

  const result: OrderPlan[] = [];

  for (const item of orders) {

    for (const property of item.properties) {

      if (
        property.value.type !== "Literal"
      ) {
        continue;
      }

      result.push({
        field: property.key.name,

        direction:
          String(property.value.value).toUpperCase() as
            | "ASC"
            | "DESC",
      });

    }

  }

  return result;
}
  
private buildJoins(
  include?: IncludeNode,
): JoinPlan[] {

  if (!include) {
    return [];
  }

  const joins: JoinPlan[] = [];

  for (const property of include.properties) {

    joins.push({

      table: property.key.name,

      type: "LEFT",

      localField: "id",

      foreignField: `${property.key.name}Id`,

      select:
        property.value.type === "ObjectExpression"
          ? property.value
          : undefined,

      where: undefined,

      includeCount:
        property.key.name === "_count",

    });

  }

  return joins;

}

  private buildWhere(
  where?: WhereNode,
): WhereNode | undefined {
  return where;
  }
  
  private buildGroupBy(
  by?: string[],
): string[] {
  return by ?? [];
  }
  
  private buildHaving(
  having?: WhereNode,
): WhereNode | undefined {
  return having;
  }
  
  private buildDistinct(
  distinct?: string[],
): boolean {

  return !!distinct?.length;

}

  
}