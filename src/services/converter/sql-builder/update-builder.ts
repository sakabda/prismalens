import type {
  SqlExpression,
  SqlUpdateStatement,
} from "../ast/sql";


export class UpdateBuilder {

  private readonly valuesMap:
    Record<string, SqlExpression> = {};


  private whereExpression?: SqlExpression;



  constructor(
    private readonly table: string,
  ) {}



  set(
    column: string,
    value: SqlExpression,
  ): this {

    this.valuesMap[column] = value;

    return this;
  }



  where(
    expression?: SqlExpression,
  ): this {

    this.whereExpression = expression;

    return this;
  }



  build(): SqlUpdateStatement {

    return {

      type: "UpdateStatement",

      table: this.table,

      values: this.valuesMap,

      where: this.whereExpression,

    };

  }

}