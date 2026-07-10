import type { SqlDialect } from "../types";


export class SqliteDialect implements SqlDialect {



  quoteIdentifier(
    identifier: string
  ): string {

    return `"${identifier}"`;
  }



  parameter(
    index: number
  ): string {

    return "?";
  }




  escapeString(
    value: string
  ): string {

    return value
      .replace(/'/g, "''");
  }





  boolean(
    value:boolean
  ): string {

    return value ? "1" : "0";
  }





  nullValue(): string {

    return "NULL";
  }





  currentTimestamp(): string {

    return "CURRENT_TIMESTAMP";
  }





  returning(
    columns:string[]
  ): string {

    /**
     * SQLite >= 3.35 supports RETURNING
     */

    if(!columns.length) {
      return "";
    }


    return `RETURNING ${columns.join(", ")}`;
  }





  limit(
    value:number
  ): string {

    return `LIMIT ${value}`;
  }


}