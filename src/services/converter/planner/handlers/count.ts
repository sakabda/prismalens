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


export class CountHandler
  extends FindManyHandler {


  readonly operation = "count";


  override plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlSelectStatement {


    return {
      ...super.plan(
        query,
        context,
      ),

      columns: [
        {
          name: "COUNT(*)",
          alias: "count",
        },
      ],

    };

  }

}