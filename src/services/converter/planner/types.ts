import type {
  QueryNode,
  PrismaOperation,
} from "../ast/prisma";

import type { SqlStatement } from "../ast/sql";

import type { PlanningContext } from "./context";

export interface PlannerHandler {
  readonly operation: PrismaOperation;

  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlStatement;
}