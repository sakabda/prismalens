import { buildFindMany } from "./findMany";

export function buildFindFirst(
  model: string,
  args: Record<string, any>,
) {
  return (
    buildFindMany(model, {
      ...args,
      take: 1,
    })
  );
}