export const PrismaOperators: Record<
  string,
  string
> = {
  equals: "=",
  not: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  in: "IN",
  notIn: "NOT IN",
  contains: "LIKE",
  startsWith: "LIKE",
  endsWith: "LIKE",
};

export function getSqlOperator(
  operator: string,
): string {
  return PrismaOperators[operator] ?? "=";
}