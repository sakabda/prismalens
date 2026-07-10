import type { ExpressionNode } from "../ast/expression";

/**
 * Metadata about a model/table.
 * This will later be populated from the Prisma DMMF.
 */
export interface ModelMetadata {
  readonly name: string;
  readonly tableName: string;
  readonly fields: readonly FieldMetadata[];
}

export interface FieldMetadata {
  readonly name: string;
  readonly columnName: string;
  readonly type: string;

  readonly isId: boolean;
  readonly isList: boolean;
  readonly isRequired: boolean;
  readonly isRelation: boolean;

  readonly relationName?: string;
  readonly relationModel?: string;
}

/**
 * A bound SQL parameter.
 */
export interface SqlParameter {
  readonly index: number;
  readonly expression: ExpressionNode;
}

/**
 * Planner diagnostics.
 */
export interface PlannerDiagnostic {
  readonly message: string;
  readonly path?: string;
}

/**
 * Mutable planning state shared across handlers.
 */
export class PlanningContext {
  private readonly parameters: SqlParameter[] = [];
  private readonly diagnostics: PlannerDiagnostic[] = [];

  private aliasCounter = 0;

  constructor(
    private readonly models: ReadonlyMap<string, ModelMetadata>,
  ) {}

  getModel(name: string): ModelMetadata {
    const model = this.models.get(name);

    if (!model) {
      throw new Error(`Unknown Prisma model "${name}".`);
    }

    return model;
  }

  createAlias(prefix = "t"): string {
    this.aliasCounter += 1;
    return `${prefix}${this.aliasCounter}`;
  }

  addParameter(expression: ExpressionNode): number {
    const index = this.parameters.length + 1;

    this.parameters.push({
      index,
      expression,
    });

    return index;
  }

  addDiagnostic(message: string, path?: string): void {
    this.diagnostics.push({
      message,
      path,
    });
  }

  getParameters(): readonly SqlParameter[] {
    return this.parameters;
  }

  getDiagnostics(): readonly PlannerDiagnostic[] {
    return this.diagnostics;
  }
}