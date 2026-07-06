import { quote } from "../utils/escape";
import { buildExpression } from "./expression";

export function buildValue(value: any): string {
  if (
    value &&
    typeof value === "object" &&
    "type" in value
  ) {
    return buildExpression(value);
  }

  return quote(value);
}

