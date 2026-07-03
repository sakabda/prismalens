import { buildWhere } from "../builders/where";

export function buildCount(
  model: string,
  args: Record<string, any>,
) {
  return `
SELECT COUNT(*)
FROM ${model}
${buildWhere(args.where)};
`.trim();
}