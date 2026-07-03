import { quote } from "../utils/escape";

export function buildValues(
  data: Record<string, any>,
): string {

  return Object.values(data)
    .map(quote)
    .join(", ");

}

export function buildColumns(
  data: Record<string, any>,
): string {

  return Object.keys(data)
    .join(", ");

}