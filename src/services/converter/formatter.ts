import { ASTBuilder } from "./ast-builder";

import { Planner } from "./planner";
import { PlanningContext } from "./planner/context";

import type {
  PlannerHandler,
} from "./planner/types";

import { SQLFormatter } from "./formatter/sql";

import type {
  Token,
} from "./types";

import type {
  QueryNode,
} from "./ast/prisma";



export class QueryFormatter {


  private readonly planner: Planner;

  private readonly formatter =
    new SQLFormatter();



  constructor(
    handlers: readonly PlannerHandler[],
    context: PlanningContext,
  ) {

    this.planner =
      new Planner(
        handlers,
        context,
      );

  }





  formatSQLFromTokens(
    tokens: Token[],
  ): string {


    const ast =
      new ASTBuilder(
        tokens,
      ).build();



    if (!ast) {

      return "-- Invalid query";

    }



    const sqlNode =
      this.planner.plan(
        ast,
      );



    return this.formatter.format(
      sqlNode,
    );

  }





  formatSQLFromAST(
    ast: QueryNode,
  ): string {


    const sqlNode =
      this.planner.plan(
        ast,
      );



    return this.formatter.format(
      sqlNode,
    );

  }

}