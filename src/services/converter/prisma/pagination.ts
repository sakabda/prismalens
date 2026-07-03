export function sqlPaginationToPrisma(
  limit?: number,
  offset?: number,
) {
  const result: Record<
    string,
    number
  > = {};

  if (limit !== undefined)
    result.take = limit;

  if (offset !== undefined)
    result.skip = offset;

  return result;
}