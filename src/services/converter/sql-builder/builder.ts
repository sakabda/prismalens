import type {
  SqlDeleteStatement,
  SqlInsertStatement,
  SqlSelectStatement,
  SqlUpdateStatement,
} from "../ast/sql";


export abstract class SqlBuilder {


  protected createSelect(
    table: string,
  ): SqlSelectStatement {

    return {

      type: "SelectStatement",

      table,

      columns: [],

      where: undefined,

      orderBy: [],

      limit: undefined,

    };

  }





  protected createInsert(
    table: string,
  ): SqlInsertStatement {

    return {

      type: "InsertStatement",

      table,

      columns: [],

      values: [],

    };

  }





  protected createUpdate(
    table: string,
  ): SqlUpdateStatement {

    return {

      type: "UpdateStatement",

      table,

      values: {},

      where: undefined,

    };

  }





  protected createDelete(
    table: string,
  ): SqlDeleteStatement {

    return {

      type: "DeleteStatement",

      table,

      where: undefined,

    };

  }

}