import type {
  QueryNode,
} from "../../ast/prisma";

import type {
  SqlSelectStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
} from "../context";

import {
  FindManyHandler,
} from "./find-many";


export class FindFirstHandler
  extends FindManyHandler {


  readonly operation = "findFirst";


  override plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlSelectStatement {


    return {
      ...super.plan(
        query,
        context,
      ),

      limit: 1,
    };

  }

}