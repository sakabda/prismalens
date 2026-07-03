import { quote } from "../utils/escape";

export function buildUpdateSet(
  data: Record<string, any>,
): string {
  return Object.entries(data)
    .map(([key, value]) => `${key} = ${quote(value)}`)
    .join(", ");
}