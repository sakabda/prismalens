export function sqlSelectToPrisma(
  columns: string[],
): Record<string, boolean> {
  if (
    columns.length === 1 &&
    columns[0] === "*"
  ) {
    return {};
  }

  const select: Record<
    string,
    boolean
  > = {};

  columns.forEach((col) => {
    select[col] = true;
  });

  return select;
}