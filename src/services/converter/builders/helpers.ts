export { quote } from "../utils/escape";

export function isObject(
  value: unknown,
): value is Record<string, any> {

  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );

}

export function wrapIdentifier(
  identifier: string,
): string {

  return `\`${identifier}\``;

}

export function snakeCase(
  value: string,
): string {

  return value
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, "");

}

export function capitalize(
  value: string,
): string {

  return value.charAt(0).toUpperCase() + value.slice(1);

}