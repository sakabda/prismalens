import type { QueryNode } from "../ast/prisma";
import type { Registry } from "../schema/registry";

export interface Diagnostic {
  message: string;
}

export interface SemanticResult {
  valid: boolean;
  diagnostics: Diagnostic[];
}

export class SemanticAnalyzer {
  constructor(
    private readonly registry: Registry,
  ) {}

  analyze(
    ast: QueryNode,
  ): SemanticResult {

    const diagnostics: Diagnostic[] = [];

    this.validateModel(
      ast,
      diagnostics,
    );

    return {
      valid: diagnostics.length === 0,
      diagnostics,
    };
  }

  //----------------------------------

  private validateModel(
    ast: QueryNode,
    diagnostics: Diagnostic[],
  ) {
    if (!this.registry.hasModel(ast.model)) {
      diagnostics.push({
        message:
          `Unknown model "${ast.model}".`,
      });
    }
  }
}