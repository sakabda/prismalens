import type {
  SqlInsertStatement,
  SqlExpression,
} from "../ast/sql";


export class InsertBuilder {

  private columnsList: string[] = [];

  private readonly valuesListData: SqlExpression[] = [];


  constructor(
    private readonly table: string,
  ) {}



  columns(
    ...columns: string[]
  ): this {

    this.columnsList.push(...columns);

    return this;
  }



  values(
    ...values: SqlExpression[]
  ): this {

    this.valuesListData.push(...values);

    return this;
  }



  build(): SqlInsertStatement {

    return {

      type: "InsertStatement",

      table: this.table,

      columns: this.columnsList,

      values: this.valuesListData,

    };

  }

}