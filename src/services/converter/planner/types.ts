import type {
  ObjectExpressionNode,
} from "../ast/expression";

export interface QueryPlan {
  operation:
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE";

  table: string;

  select?: SelectPlan;

  insert?: InsertPlan;

  update?: UpdatePlan;

  delete?: DeletePlan;
}

export interface SelectPlan {
  columns: ColumnPlan[];

  joins: JoinPlan[];

  where?: ObjectExpressionNode;

  orderBy: OrderPlan[];

  groupBy: string[];

  having?: ObjectExpressionNode;

  limit?: number;

  offset?: number;

  distinct: boolean;
}

export interface InsertPlan {
  rows: Record<string, unknown>[];
}

export interface UpdatePlan {
  values: Record<string, unknown>;

  where?: ObjectExpressionNode;
}

export interface DeletePlan {
  where?: ObjectExpressionNode;
}

export interface ColumnPlan {
  expression: string;

  alias?: string;
}

export interface JoinPlan {
  table: string;

  type: "LEFT" | "INNER";

  localField: string;

  foreignField: string;

  where?: ObjectExpressionNode;

  select?: ObjectExpressionNode;

  includeCount?: boolean;
}

export interface OrderPlan {
  field: string;

  direction: "ASC" | "DESC";
}