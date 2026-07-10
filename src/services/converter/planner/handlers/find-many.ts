import type {
  QueryNode,
  OrderByNode,
} from "../../ast/prisma";

import type {
  SqlOrderBy,
  SqlSelectStatement,
} from "../../ast/sql";

import type {
  PlanningContext,
} from "../context";

import {
  BasePlannerHandler,
} from "./base-handler";


export class FindManyHandler
  extends BasePlannerHandler {


 readonly operation:
    | "findMany"
    | "findFirst"
    | "findUnique"
    | "count" =
    "findMany";


  plan(
    query: QueryNode,
    context: PlanningContext,
  ): SqlSelectStatement {


    const args = query.args;


    return {

      type: "SelectStatement",


      table:
        this.getTable(
          context,
          query.model,
        ),


      columns: [
        {
          name: "*",
        },
      ],


      orderBy:
        this.planOrderBy(
          args.orderBy,
        ),


      limit:
        args.take,


      offset:
        args.skip,

    };

  }



  private planOrderBy(
    orderBy:
      | OrderByNode
      | OrderByNode[]
      | undefined,
  ): SqlOrderBy[] | undefined {


    if (!orderBy) {
      return undefined;
    }


    const nodes =
      Array.isArray(orderBy)
        ? orderBy
        : [orderBy];



    return nodes.flatMap(node =>

      node.properties.map(property => {


        let direction:
          "ASC" | "DESC" =
          "ASC";


        if (
          property.value.type === "Literal"
          &&
          String(
            property.value.value,
          ).toUpperCase()
            === "DESC"
        ) {

          direction = "DESC";

        }


        return {

          column:
            property.key.name,


          direction,

        };

      }),

    );

  }

}