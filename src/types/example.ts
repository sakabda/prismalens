export type ExampleCategory =
  | "basic"
  | "crud"
  | "filtering"
  | "relations"
  | "sorting"
  | "pagination"
  | "aggregation"
  | "advanced";

export type ExampleDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export interface QueryExample {
  id: string;

  name: string;

  description: string;

  category: ExampleCategory;

  difficulty: ExampleDifficulty;

  tags: string[];

  prisma: string;

  sql: string;
}