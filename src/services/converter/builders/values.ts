import { quote } from "../utils/escape";
import { buildExpression } from "./expression";

export function buildValues(
  data: Record<string, any>,
): string {
  return Object.values(data)
    .map((value) => {
      if (
        value &&
        typeof value === "object" &&
        "type" in value
      ) {
        return buildExpression(value);
      }

      return quote(value);
    })
    .join(", ");
}

export function buildColumns(
  data: Record<string, any>,
): string {
  return Object.keys(data).join(", ");
}