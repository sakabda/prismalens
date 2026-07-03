export interface JoinDefinition {
  table: string;
  localKey: string;
  foreignKey: string;
  type: "LEFT" | "INNER";
  warning?: string;
}

export function buildJoins(
  baseTable: string,
  joins: JoinDefinition[],
): string {
  if (!joins.length) return "";

  return joins
    .map((join) => {
      const sql = `${join.type} JOIN ${join.table} ON ${join.table}.${join.foreignKey} = ${baseTable}.${join.localKey}`;
      if (join.warning) {
        return `-- WARNING: ${join.warning}\n${sql}`;
      }
      return sql;
    })
    .join("\n");
}