// ============================================
// Converter Types
// ============================================

export type PrismaOperation =
  | "findMany"
  | "findFirst"
  | "findUnique"
  | "findUniqueOrThrow"
  | "findFirstOrThrow"
  | "create"
  | "createMany"
  | "update"
  | "updateMany"
  | "delete"
  | "deleteMany"
  | "upsert"
  | "count"
  | "aggregate"
  | "groupBy";

// --------------------------------------------
// Token Types
// --------------------------------------------

export type TokenType =
  | "identifier"
  | "keyword"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "dot"
  | "colon"
  | "comma"
  | "paren_open"
  | "paren_close"
  | "brace_open"
  | "brace_close"
  | "bracket_open"
  | "bracket_close";

export interface Token {
  type: TokenType;
  value: string;
}

// --------------------------------------------
// Prisma Query Types
// --------------------------------------------

export type Primitive = string | number | boolean | null;

export interface PrismaOperator {
  equals?: Primitive;
  not?: Primitive | PrismaOperator;
  in?: Primitive[];
  notIn?: Primitive[];

  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;

  contains?: string;
  startsWith?: string;
  endsWith?: string;

  mode?: "default" | "insensitive";
}

export interface PrismaWhere {
  AND?: PrismaWhere[];
  OR?: PrismaWhere[];
  NOT?: PrismaWhere[];

  [field: string]:
    | Primitive
    | PrismaOperator
    | PrismaWhere
    | PrismaWhere[]
    | undefined;
}

export interface PrismaOrderBy {
  [field: string]: "asc" | "desc";
}

export interface PrismaSelect {
  [field: string]: boolean;
}

export interface PrismaInclude {
  [relation: string]: boolean;
}

export interface PrismaQueryArgs {
  select?: PrismaSelect;

  include?: PrismaInclude;

  where?: PrismaWhere;

  orderBy?: PrismaOrderBy | PrismaOrderBy[];

  take?: number;

  skip?: number;

  cursor?: Record<string, Primitive>;

  distinct?: string[];

  data?: Record<string, unknown>;

  by?: string[];

  having?: PrismaWhere;

  _count?: boolean;

  _sum?: Record<string, boolean>;

  _avg?: Record<string, boolean>;

  _min?: Record<string, boolean>;

  _max?: Record<string, boolean>;
}

export interface PrismaQueryAST {
  model: string;

  operation: PrismaOperation;

  args: PrismaQueryArgs;
}

// --------------------------------------------
// Parser State
// --------------------------------------------

export interface ParserState {
  tokens: Token[];
  current: number;
}