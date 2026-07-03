export function quote(value: unknown): string {

  if (value === null)
    return "NULL";

  if (typeof value === "number")
    return value.toString();

  if (typeof value === "boolean")
    return value ? "TRUE" : "FALSE";

  return `'${String(value)
    .replace(/'/g, "''")}'`;

}

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