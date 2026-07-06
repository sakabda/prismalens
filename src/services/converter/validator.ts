import type {
  PrismaOrderBy,
  PrismaQueryAST,
  PrismaWhere,
} from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class PrismaValidator {
  validate(ast: PrismaQueryAST): ValidationResult {
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

  // -----------------------------------------

  private validateModel(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
    if (!ast.model.trim()) {
      errors.push("Model name is required.");
    }
  }

  // -----------------------------------------

  private validateOperation(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
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

  // -----------------------------------------

  private validateTake(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
    if (
      ast.args.take !== undefined &&
      (!Number.isInteger(ast.args.take) ||
        ast.args.take < 0)
    ) {
      errors.push("take must be a positive integer.");
    }
  }

  // -----------------------------------------

  private validateSkip(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
    if (
      ast.args.skip !== undefined &&
      (!Number.isInteger(ast.args.skip) ||
        ast.args.skip < 0)
    ) {
      errors.push("skip must be a positive integer.");
    }
  }

  // -----------------------------------------

  private validateSelect(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
    if (!ast.args.select) {
      return;
    }

    for (const [field, value] of Object.entries(ast.args.select)) {
      if (typeof value !== "boolean") {
        errors.push(
          `select.${field} must be true or false.`,
        );
      }
    }
  }

  // -----------------------------------------

  private validateOrderBy(
    ast: PrismaQueryAST,
    errors: string[],
  ): void {
    if (!ast.args.orderBy) {
      return;
    }

    const items = Array.isArray(ast.args.orderBy)
      ? ast.args.orderBy
      : [ast.args.orderBy];

    for (const item of items) {
      this.validateOrderItem(item, errors);
    }
  }

  private validateOrderItem(
    item: PrismaOrderBy,
    errors: string[],
  ): void {
    for (const [field, direction] of Object.entries(item)) {
      if (
        direction !== "asc" &&
        direction !== "desc"
      ) {
        errors.push(
          `orderBy.${field} must be "asc" or "desc".`,
        );
      }
    }
  }

  // -----------------------------------------

  private validateWhere(
    where: PrismaWhere | undefined,
    errors: string[],
    path = "where",
  ): void {
    if (!where) {
      return;
    }

    for (const [key, value] of Object.entries(where)) {
      if (
        key === "AND" ||
        key === "OR" ||
        key === "NOT"
      ) {
        if (!Array.isArray(value)) {
          errors.push(`${path}.${key} must be an array.`);
          continue;
        }

        value.forEach((condition, index) => {
          this.validateWhere(
            condition,
            errors,
            `${path}.${key}[${index}]`,
          );
        });

        continue;
      }

      // if (
      //   value !== null &&
      //   typeof value === "object" &&
      //  '! 'Array.isArray(value)
      // ) {
      //   for (const operator of Object.keys(value)) {
      //     const supported = [
      //       "equals",
      //       "not",
      //       "in",
      //       "notIn",
      //       "lt",
      //       "lte",
      //       "gt",
      //       "gte",
      //       "contains",
      //       "startsWith",
      //       "endsWith",
      //       "mode",
      //     ];

      //     if (!supported.includes(operator)) {
      //       errors.push(
      //         `${path}.${key}: Unsupported operator "${operator}".`,
      //       );
      //     }
      //   }
      // }

      if (
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value)
) {
  // -----------------------------------------
  // AST Expression Node
  // -----------------------------------------

  if ("type" in value) {
    continue;
  }

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

  for (const operator of Object.keys(value)) {
    if (!supported.includes(operator)) {
      errors.push(
        `${path}.${key}: Unsupported operator "${operator}".`,
      );
    }
  }
}
    }
  }
}