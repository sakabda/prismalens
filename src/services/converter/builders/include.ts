import type { JoinDefinition } from "./joins";

export interface SchemaRegistry {
  getForeignKey(model: string, relation: string): { local: string; foreign: string } | null;
}

export function buildInclude(
  baseTable: string,
  include?: Record<string, boolean>,
  schema?: SchemaRegistry
): JoinDefinition[] {
  if (!include) return [];

  const joins: JoinDefinition[] = [];

  Object.entries(include).forEach(([relation, enabled]) => {
    if (!enabled) return;

    let localKey = "{pk}";
    let foreignKey = "{fk}";
    let warning: string | undefined = `Relation '${relation}' requires schema.prisma to resolve foreign keys`;

    if (schema) {
      const keys = schema.getForeignKey(baseTable, relation);
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
      warning
    });
  });

  return joins;
}