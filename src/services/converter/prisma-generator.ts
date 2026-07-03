import type { PrismaQueryAST } from "./types";

export class PrismaGenerator {
  /**
   * Convert AST back into a formatted Prisma query
   */
  generate(ast: PrismaQueryAST): string {
    const args = this.formatValue(ast.args, 1);

    return `prisma.${ast.model}.${ast.operation}(${args})`;
  }

  private formatValue(value: unknown, indent = 0): string {
    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      return this.formatArray(value, indent);
    }

    switch (typeof value) {
      case "string":
        return this.formatString(value);

      case "number":
      case "boolean":
        return String(value);

      case "object":
        return this.formatObject(
          value as Record<string, unknown>,
          indent,
        );

      default:
        return "undefined";
    }
  }

  private formatObject(
    obj: Record<string, unknown>,
    indent: number,
  ): string {
    const entries = Object.entries(obj);

    if (entries.length === 0) {
      return "{}";
    }

    const space = "  ".repeat(indent);
    const parent = "  ".repeat(indent - 1);

    const body = entries
      .map(
        ([key, value]) =>
          `${space}${key}: ${this.formatValue(value, indent + 1)}`,
      )
      .join(",\n");

    return `{\n${body}\n${parent}}`;
  }

  private formatArray(
    arr: unknown[],
    indent: number,
  ): string {
    if (arr.length === 0) {
      return "[]";
    }

    const space = "  ".repeat(indent);
    const parent = "  ".repeat(indent - 1);

    const body = arr
      .map(
        (item) => `${space}${this.formatValue(item, indent + 1)}`,
      )
      .join(",\n");

    return `[\n${body}\n${parent}]`;
  }

  private formatString(value: string): string {
    /**
     * Prisma enum / identifier
     */
    if (/^[A-Z][A-Za-z0-9_]*$/.test(value)) {
      return value;
    }

    /**
     * DateTime helper
     */
    if (
      /^\d{4}-\d{2}-\d{2}T/.test(value)
    ) {
      return `new Date("${value}")`;
    }

    return `"${value}"`;
  }
}