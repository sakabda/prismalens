import type {
  QueryNode,
  PrismaOperation,
} from "../ast/prisma";


import type {
  SqlStatement,
} from "../ast/sql";

import { PlanningContext } from "./context";
import type { PlannerHandler } from "./types";

export class Planner {
  private readonly handlers = new Map<
    PrismaOperation,
    PlannerHandler
  >();

  constructor(
    handlers: readonly PlannerHandler[],
    private readonly context: PlanningContext,
  ) {
    for (const handler of handlers) {
      this.handlers.set(handler.operation, handler);
    }
  }

 plan(query: QueryNode): SqlStatement {
  const handler = this.handlers.get(query.operation);

  if (!handler) {
    throw new Error(
      `Unsupported Prisma operation "${query.operation}".`,
    );
  }

  return handler.plan(query, this.context);
}
}