import { buildDelete } from "../builders/delete";

export function buildDeleteOperation(
  model: string,
  args: Record<string, any>,
) {
  return buildDelete(model, args.where);
}