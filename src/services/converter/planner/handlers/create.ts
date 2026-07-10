import type {
  QueryNode,
  DataNode,
} from "../../ast/prisma";

import type {
  SqlInsertStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
} from "../context";

import {
  BasePlannerHandler,
} from "./base-handler";


export class CreateHandler
  extends BasePlannerHandler {


  readonly operation = "create";


  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlInsertStatement {


    const data =
      query.args.data;


    if (
      !data ||
      Array.isArray(data)
    ) {
      throw new Error(
        "Create requires a single data object.",
      );
    }


    const columns: string[] = [];

    const values = [];


    for (
      const property of data.properties
    ) {

      columns.push(
        property.key.name,
      );


      const index =
        context.addParameter(
          property.value,
        );


      values.push({
        type: "Parameter",
        index,
      });

    }


    return {

      type: "InsertStatement",

      table:
        this.getTable(
          context,
          query.model,
        ),

      columns,

      values,

    };

  }

}