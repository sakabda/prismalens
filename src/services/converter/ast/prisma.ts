/* ===========================================
 * PrismaLens Compiler AST
 * Version: 2.0
 * =========================================== */

import type {
  ExpressionNode,
  ObjectExpressionNode,
  ArrayExpressionNode,
} from "./expression";


/* =====================================================
 * Supported Prisma Operations
 * ===================================================== */

export type PrismaOperation =
  | "findUnique"
  | "findUniqueOrThrow"
  | "findFirst"
  | "findFirstOrThrow"
  | "findMany"
  | "create"
  | "createMany"
  | "update"
  | "updateMany"
  | "upsert"
  | "delete"
  | "deleteMany"
  | "count"
  | "aggregate"
  | "groupBy";


/* =====================================================
 * Root Query
 * ===================================================== */

export interface QueryNode {

  type: "Query";

  model: string;

  operation: PrismaOperation;

  args: PrismaArgumentsNode;

}


/* =====================================================
 * Prisma Arguments
 * ===================================================== */

export interface PrismaArgumentsNode {

  select?: SelectNode;

  include?: IncludeNode;

  omit?: OmitNode;


  where?: WhereNode;


  orderBy?: OrderByNode | OrderByNode[];


  cursor?: CursorNode;


  /**
   * create / update / upsert
   */
  data?: DataNode;


  /**
   * createMany
   */
  dataMany?: DataNode[];


  create?: DataNode;


  update?: DataNode;


  having?: WhereNode;


  distinct?: string[];


  by?: string[];


  take?: number;


  skip?: number;

}


/* =====================================================
 * Select
 * ===================================================== */

export interface SelectNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Include
 * ===================================================== */

export interface IncludeNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Omit
 * ===================================================== */

export interface OmitNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Data
 * ===================================================== */

export interface DataNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Cursor
 * ===================================================== */

export interface CursorNode
  extends ObjectExpressionNode {}


/* =====================================================
 * OrderBy
 * ===================================================== */

export interface OrderByNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Where
 * ===================================================== */

export interface WhereNode
  extends ObjectExpressionNode {}


/* =====================================================
 * Generic AST aliases
 * ===================================================== */

export type PrismaValueNode =
  | ExpressionNode
  | ObjectExpressionNode
  | ArrayExpressionNode;