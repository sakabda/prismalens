import {
  BaseGenerator,
} from "./base-generator";


import {
  PostgresDialect,
} from "./dialect/postgres-dialect";



export class PostgresGenerator extends BaseGenerator {


  constructor() {

    super(
      new PostgresDialect(),
    );

  }

}