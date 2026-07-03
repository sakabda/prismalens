export interface JoinDefinition {
  table: string;
  localKey: string;
  foreignKey: string;
  type: "LEFT" | "INNER";
}

export function buildJoins(
  baseTable: string,
  joins: JoinDefinition[],
): string {
  if (!joins.length) return "";

  return joins
    .map(
      (join) =>
        `${join.type} JOIN ${join.table}
ON ${join.table}.${join.foreignKey} = ${baseTable}.${join.localKey}`,
    )
    .join("\n");
}