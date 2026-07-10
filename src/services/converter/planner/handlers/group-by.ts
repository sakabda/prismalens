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
  BasePlannerHandler,
} from "./base-handler";


interface GroupByArgs {
  by: string[];

  _count?:
    | boolean
    | Record<string, boolean>;

  _avg?:
    Record<string, boolean>;

  _sum?:
    Record<string, boolean>;

  _min?:
    Record<string, boolean>;

  _max?:
    Record<string, boolean>;
}



export class GroupByHandler
  extends BasePlannerHandler {


  readonly operation =
    "groupBy";



  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlSelectStatement {


    const args =
      query.args as unknown as GroupByArgs;



    const columns: {
      name: string;
      alias?: string;
    }[] = [];



    /*
     * GROUP BY fields
     */
    for (
      const field of args.by ?? []
    ) {

      columns.push({
        name: field,
      });

    }



    /*
     * Aggregations
     */
    if (args._count) {

      columns.push({
        name: "COUNT(*)",
        alias: "_count",
      });

    }



    if (args._avg) {

      Object.keys(args._avg)
        .forEach(field => {

          columns.push({
            name: `AVG(${field})`,
            alias: `_avg_${field}`,
          });

        });

    }



    if (args._sum) {

      Object.keys(args._sum)
        .forEach(field => {

          columns.push({
            name: `SUM(${field})`,
            alias: `_sum_${field}`,
          });

        });

    }



    if (args._min) {

      Object.keys(args._min)
        .forEach(field => {

          columns.push({
            name: `MIN(${field})`,
            alias: `_min_${field}`,
          });

        });

    }



    if (args._max) {

      Object.keys(args._max)
        .forEach(field => {

          columns.push({
            name: `MAX(${field})`,
            alias: `_max_${field}`,
          });

        });

    }



    return {

      type: "SelectStatement",


      table:
        this.getTable(
          context,
          query.model,
        ),


      columns,


      groupBy:
        args.by ?? [],

    };

  }

}