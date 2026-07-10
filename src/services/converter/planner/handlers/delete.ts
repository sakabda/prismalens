import type {
  QueryNode,
} from "../../ast/prisma";

import type {
  SqlDeleteStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
} from "../context";

import {
  BasePlannerHandler,
} from "./base-handler";


export class DeleteHandler
  extends BasePlannerHandler {


  readonly operation = "delete";


  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlDeleteStatement {


    return {

      type: "DeleteStatement",

      table:
        this.getTable(
          context,
          query.model,
        ),

    };

  }

}