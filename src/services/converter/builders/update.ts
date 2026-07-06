import { buildValue } from "./value";

export function buildUpdateSet(
  data: Record<string, any>,
): string {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${key} = ${buildValue(value)}`
    )
    .join(", ");
}