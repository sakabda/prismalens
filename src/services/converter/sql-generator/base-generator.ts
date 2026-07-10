import type {
  SqlStatement,
} from "../ast/sql";

import type {
  GeneratedSql,
  GeneratorContext,
  GeneratorOptions,
  SqlDialect,
} from "./types";

import { StatementVisitor } from "./visitors/statement-visitor";


/**
 * Base SQL generator.
 *
 * Owns generation context and delegates
 * SQL rendering to visitors.
 */
export abstract class BaseGenerator {

  protected readonly context: GeneratorContext;

  protected readonly statementVisitor: StatementVisitor;


  protected constructor(
    protected readonly dialect: SqlDialect,
    options: GeneratorOptions = {},
  ) {

    const parameters: unknown[] = [];


    this.context = {

      dialect,


      options: {

        pretty:
          options.pretty ?? false,

        indent:
          options.indent ?? "  ",

      },


      parameters,


      nextParameter(
        value: unknown,
      ): string {

        parameters.push(value);


        return dialect.parameter(
          parameters.length,
        );

      },

    };


    this.statementVisitor =
      new StatementVisitor(
        this.context,
      );

  }



  /**
   * Generates SQL from SQL AST.
   */
  generate(
    statement: SqlStatement,
  ): GeneratedSql {


    // reset parameters before every generation
    this.context.parameters.length = 0;


    const sql =
      this.statementVisitor.visit(
        statement,
      );


    return {

      sql,


      parameters: [
        ...this.context.parameters,
      ],

    };

  }

}