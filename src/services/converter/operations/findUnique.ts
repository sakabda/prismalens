import { buildWhere } from "../builders/where";
import { buildSelect } from "../builders/select";

export function buildFindUnique(
  model: string,
  args: Record<string, any>,
) {
  const select = buildSelect(args.select);

  return `
SELECT ${select}
FROM ${model}
${buildWhere(args.where)}
LIMIT 1;
`.trim();
}