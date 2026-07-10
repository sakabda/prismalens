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


export class FindUniqueHandler
  extends FindManyHandler {


  readonly operation = "findUnique";


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