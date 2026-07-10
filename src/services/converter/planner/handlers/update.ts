import type {
  QueryNode,
} from "../../ast/prisma";

import type {
  SqlUpdateStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
} from "../context";

import {
  BasePlannerHandler,
} from "./base-handler";


export class UpdateHandler
  extends BasePlannerHandler {


  readonly operation = "update";


  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlUpdateStatement {


    const data =
      query.args.data;


    if (
      !data ||
      Array.isArray(data)
    ) {
      throw new Error(
        "Update requires a single data object.",
      );
    }


    const values:
      Record<string, any> = {};


    for (
      const property of data.properties
    ) {

      const index =
        context.addParameter(
          property.value,
        );


      values[property.key.name] = {
        type: "Parameter",
        index,
      };

    }


    return {

      type: "UpdateStatement",

      table:
        this.getTable(
          context,
          query.model,
        ),

      values,

    };

  }

}