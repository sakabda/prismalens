import { ASTBuilder } from "./ast-builder";
import { PrismaValidator } from "./validator";
import { PrismaGenerator } from "./prisma-generator";
import { QueryAnalyzer } from "./query-analyzer";

import { Planner } from "./planner";
import { PlanningContext } from "./planner/context";
import type { PlannerHandler } from "./planner/types";

import { SQLFormatter } from "./formatter/sql";

import type {
  QueryNode,
} from "./ast/prisma";



export class Converter {


  private validator =
    new PrismaValidator();


  private prismaGenerator =
    new PrismaGenerator();


  private analyzer =
    new QueryAnalyzer();


  private planner: Planner;



  private formatter =
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





  toSQL(
    ast: QueryNode,
  ): string {


    const validation =
      this.validator.validate(
        ast,
      );


    if (!validation.valid) {

      return this.formatErrors(
        validation.errors,
      );

    }



    const sqlNode =
      this.planner.plan(
        ast,
      );



    return this.formatter.format(
      sqlNode,
    );

  }





  toPrisma(
    ast: QueryNode,
  ): string {


    const validation =
      this.validator.validate(
        ast,
      );


    if (!validation.valid) {

      return this.formatErrors(
        validation.errors,
      );

    }



    return this.prismaGenerator.generate(
      ast as any,
    );

  }





  analyze(
    ast: QueryNode,
  ) {

    return this.analyzer.analyze(
      ast as any,
    );

  }





  process(
    ast: QueryNode,
  ) {


    const validation =
      this.validator.validate(
        ast,
      );


    if (!validation.valid) {

      return {
        error: true,
        messages: validation.errors,
      };

    }



    const sqlNode =
      this.planner.plan(
        ast,
      );



    return {

      sql:
        this.formatter.format(
          sqlNode,
        ),


      prisma:
        this.prismaGenerator.generate(
          ast as any,
        ),


      analysis:
        this.analyzer.analyze(
          ast as any,
        ),

    };

  }





  prismaToSQL(
    tokens: any[],
  ): string {


    const builder =
      new ASTBuilder(
        tokens as any,
      );


    const ast =
      builder.build();



    if (!ast) {

      return "-- Invalid Prisma input";

    }



    const sqlNode =
      this.planner.plan(
        ast,
      );



    return this.formatter.format(
      sqlNode,
    );

  }





  private formatErrors(
    errors: string[],
  ) {

    return (
      `-- Conversion failed:\n` +
      errors
        .map(
          error => `-- ${error}`,
        )
        .join("\n")
    );

  }

}