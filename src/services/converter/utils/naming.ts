export function camelToSnake(str: string): string {
  return str.replace(
    /[A-Z]/g,
    (letter) => "_" + letter.toLowerCase(),
  );
}

export function snakeToCamel(str: string): string {
  return str.replace(
    /([-_][a-z])/g,
    (group) =>
      group
        .toUpperCase()
        .replace("-", "")
        .replace("_", ""),
  );
}

export function quoteIdentifier(name: string): string {
  return `"${name}"`;
}