import type { JoinDefinition } from "./joins";

export function buildInclude(
  include?: Record<string, boolean>,
): JoinDefinition[] {

  if (!include) return [];

  const joins: JoinDefinition[] = [];

  Object.entries(include).forEach(([table, enabled]) => {

    if (!enabled) return;

    joins.push({
      table,
      localKey: "id",
      foreignKey: `${table}Id`,
      type: "LEFT",
    });

  });

  return joins;

}