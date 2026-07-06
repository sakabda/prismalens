import type { JoinDefinition } from "./joins";
import { buildExpression } from "./expression";

export interface SchemaRegistry {
  getForeignKey(
    model: string,
    relation: string,
  ):
    | {
        local: string;
        foreign: string;
      }
    | null;
}

export function buildInclude(
  baseTable: string,
  include?: Record<string, any>,
  schema?: SchemaRegistry,
): JoinDefinition[] {
  if (!include) {
    return [];
  }

  const joins: JoinDefinition[] = [];

  for (const [relation, value] of Object.entries(include)) {
    // Ignore Prisma _count
    if (relation === "_count") {
      continue;
    }

    let enabled = false;

    // AST Literal(true)
    if (
      value &&
      typeof value === "object" &&
      value.type === "Literal"
    ) {
      enabled = buildExpression(value) === "TRUE";
    } else {
      enabled = Boolean(value);
    }

    if (!enabled) {
      continue;
    }

    let localKey = "id";
    let foreignKey = `${baseTable}Id`;
    let warning: string | undefined =
      `Relation '${relation}' requires schema.prisma to resolve foreign keys`;

    if (schema) {
      const keys = schema.getForeignKey(
        baseTable,
        relation,
      );

      if (keys) {
        localKey = keys.local;
        foreignKey = keys.foreign;
        warning = undefined;
      }
    }

    joins.push({
      table: relation,
      localKey,
      foreignKey,
      type: "LEFT",
      warning,
    });
  }

  return joins;
}