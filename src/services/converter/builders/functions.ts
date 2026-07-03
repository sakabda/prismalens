export function sqlFunction(
  fn: string,
  field: string,
): string {

  return `${fn.toUpperCase()}(${field})`;

}

export function sqlAlias(
  expression: string,
  alias: string,
): string {

  return `${expression} AS ${alias}`;

}

export function sqlDistinct(
  field: string,
): string {

  return `DISTINCT ${field}`;

}