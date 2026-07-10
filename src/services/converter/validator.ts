import type { QueryNode } from "./ast/prisma";
import type { PrismaOrderBy, PrismaWhere } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class PrismaValidator {
  validate(ast: QueryNode): ValidationResult {
    const errors: string[] = [];

    this.validateModel(ast, errors);
    this.validateOperation(ast, errors);
    this.validateTake(ast, errors);
    this.validateSkip(ast, errors);
    this.validateSelect(ast, errors);
    this.validateOrderBy(ast, errors);
    this.validateWhere(ast.args.where, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateModel(ast: QueryNode, errors: string[]) {
    if (!ast.model?.trim()) {
      errors.push("Model name is required.");
    }
  }

  private validateOperation(ast: QueryNode, errors: string[]) {
    const operations = [
      "findMany",
      "findFirst",
      "findUnique",
      "findUniqueOrThrow",
      "findFirstOrThrow",
      "create",
      "createMany",
      "update",
      "updateMany",
      "delete",
      "deleteMany",
      "upsert",
      "count",
      "aggregate",
      "groupBy",
    ];

    if (!operations.includes(ast.operation)) {
      errors.push(`Unsupported operation "${ast.operation}".`);
    }
  }

  private validateTake(ast: QueryNode, errors: string[]) {
    const take = ast.args.take;

    if (take !== undefined && (!Number.isInteger(take) || take < 0)) {
      errors.push("take must be a positive integer.");
    }
  }

  private validateSkip(ast: QueryNode, errors: string[]) {
    const skip = ast.args.skip;

    if (skip !== undefined && (!Number.isInteger(skip) || skip < 0)) {
      errors.push("skip must be a positive integer.");
    }
  }

  private validateSelect(ast: QueryNode, errors: string[]) {
    const select = ast.args.select;
    if (!select) return;

    for (const [field, value] of Object.entries(select)) {
      if (typeof value !== "boolean") {
        errors.push(`select.${field} must be true or false.`);
      }
    }
  }

  private validateOrderBy(ast: QueryNode, errors: string[]) {
    const orderBy = ast.args.orderBy;
    if (!orderBy) return;

    const items = Array.isArray(orderBy) ? orderBy : [orderBy];

    for (const item of items) {
      for (const [field, direction] of Object.entries(item)) {
        if (direction !== "asc" && direction !== "desc") {
          errors.push(`orderBy.${field} must be asc or desc.`);
        }
      }
    }
  }

  private validateWhere(where: PrismaWhere | undefined, errors: string[], path = "where") {
    if (!where) return;

    for (const [key, value] of Object.entries(where)) {
      if (key === "AND" || key === "OR" || key === "NOT") {
        if (!Array.isArray(value)) {
          errors.push(`${path}.${key} must be an array.`);
          continue;
        }

        value.forEach((v, i) =>
          this.validateWhere(v, errors, `${path}.${key}[${i}]`)
        );
        continue;
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        if ("type" in value) continue;

        const supported = [
          "equals",
          "not",
          "in",
          "notIn",
          "lt",
          "lte",
          "gt",
          "gte",
          "contains",
          "startsWith",
          "endsWith",
          "mode",
        ];

        for (const op of Object.keys(value)) {
          if (!supported.includes(op)) {
            errors.push(`${path}.${key}: Unsupported operator "${op}".`);
          }
        }
      }
    }
  }
}