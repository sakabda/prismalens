import type {
  QueryNode,
  PrismaOperation,
} from "../../ast/prisma";

import type {
  SqlStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
  ModelMetadata,
  FieldMetadata,
} from "../context";

import type { PlannerHandler } from "../types";

export abstract class BasePlannerHandler
  implements PlannerHandler
{
  abstract readonly operation: PrismaOperation;

  abstract plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlStatement;

  protected getModel(
    context: PlanningContext,
    model: string,
  ): ModelMetadata {
    return context.getModel(model);
  }

  protected getTable(
    context: PlanningContext,
    model: string,
  ): string {
    return this.getModel(
      context,
      model,
    ).tableName;
  }

  protected getField(
    context: PlanningContext,
    model: string,
    field: string,
  ): FieldMetadata {
    const metadata = this.getModel(
      context,
      model,
    );

    const result = metadata.fields.find(
      f => f.name === field,
    );

    if (!result) {
      throw new Error(
        `Unknown field "${field}" on model "${model}".`,
      );
    }

    return result;
  }

  protected requireArgs(
    query: QueryNode,
  ) {
    return query.args;
  }
}