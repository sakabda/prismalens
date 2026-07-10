import type {
  SqlIdentifier,
} from "../../ast/sql";


import type {
  GeneratorContext,
} from "../types";



/**
 * Renders SQL identifiers.
 *
 * Example:
 *
 * user -> "user"
 * email -> "email"
 */
export class IdentifierVisitor {


  constructor(
    private readonly context: GeneratorContext,
  ) {}



  visit(
    identifier: SqlIdentifier,
  ): string {

    return this.context.dialect.quoteIdentifier(
      identifier.name,
    );

  }

}