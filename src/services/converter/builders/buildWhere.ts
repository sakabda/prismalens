import type { ObjectExpressionNode } from "../ast/expression";
import { buildExpression } from "./expression";

export function buildWhere(node: ObjectExpressionNode): string {
  if (!node || !node.properties) {
    throw new Error(`Invalid WHERE AST node`);
  }

  const parts = node.properties.map((prop) => {
    if (!prop?.value) {
      throw new Error(`Invalid where property: ${prop?.key?.name}`);
    }

    const key = prop.key.name;
    const value = buildExpression(prop.value);

    return `${key} = ${value}`;
  });

  return parts.join(" AND ");
}