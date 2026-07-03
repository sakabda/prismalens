import { buildDelete } from "../builders/delete";

export function buildDeleteMany(
  model: string,
  args: Record<string, any>,
) {
  return buildDelete(model, args.where);
}