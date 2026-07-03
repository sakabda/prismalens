import type { QueryExample } from "../../../types/example";

export const paginationExamples: QueryExample[] = [
  {
    id: "take-only",
    name: "take",
    category: "pagination",
    description: "Fetch the first 10 records.",
    difficulty: "Beginner",
    tags: ["take", "limit"],
    prisma: `prisma.post.findMany({
  take: 10
})`,
    sql: `SELECT *
FROM post
LIMIT 10;`,
  },

  {
    id: "skip-only",
    name: "skip",
    category: "pagination",
    description: "Skip the first 20 records.",
    difficulty: "Beginner",
    tags: ["skip", "offset"],
    prisma: `prisma.post.findMany({
  skip: 20
})`,
    sql: `SELECT *
FROM post
OFFSET 20;`,
  },

  {
    id: "skip-take",
    name: "Offset Pagination",
    category: "pagination",
    description: "Classic page-based pagination.",
    difficulty: "Beginner",
    tags: ["skip", "take", "pagination"],
    prisma: `prisma.post.findMany({
  skip: 20,
  take: 10
})`,
    sql: `SELECT *
FROM post
LIMIT 10
OFFSET 20;`,
  },

  {
    id: "pagination-orderby",
    name: "Pagination with orderBy",
    category: "pagination",
    description: "Stable pagination using sorting.",
    difficulty: "Intermediate",
    tags: ["orderBy", "pagination"],
    prisma: `prisma.post.findMany({
  skip: 20,
  take: 10,
  orderBy: {
    createdAt: "desc"
  }
})`,
    sql: `SELECT *
FROM post
ORDER BY createdAt DESC
LIMIT 10
OFFSET 20;`,
  },

  {
    id: "cursor-pagination",
    name: "Cursor Pagination",
    category: "pagination",
    description: "Fetch records after a specific cursor.",
    difficulty: "Intermediate",
    tags: ["cursor"],
    prisma: `prisma.post.findMany({
  cursor: {
    id: 100
  },
  skip: 1,
  take: 10
})`,
    sql: `SELECT *
FROM post
WHERE id > 100
ORDER BY id ASC
LIMIT 10;`,
  },

  {
    id: "cursor-desc",
    name: "Cursor Pagination DESC",
    category: "pagination",
    description: "Cursor pagination in descending order.",
    difficulty: "Advanced",
    tags: ["cursor", "desc"],
    prisma: `prisma.post.findMany({
  cursor: {
    id: 100
  },
  skip: 1,
  take: 10,
  orderBy: {
    id: "desc"
  }
})`,
    sql: `SELECT *
FROM post
WHERE id < 100
ORDER BY id DESC
LIMIT 10;`,
  },

  {
    id: "cursor-createdat",
    name: "Cursor by Date",
    category: "pagination",
    description: "Paginate using timestamps.",
    difficulty: "Advanced",
    tags: ["cursor", "date"],
    prisma: `prisma.post.findMany({
  cursor: {
    createdAt: new Date("2024-01-01")
  },
  take: 20,
  orderBy: {
    createdAt: "asc"
  }
})`,
    sql: `SELECT *
FROM post
WHERE createdAt > '2024-01-01'
ORDER BY createdAt ASC
LIMIT 20;`,
  },

  {
    id: "infinite-scroll",
    name: "Infinite Scroll",
    category: "pagination",
    description: "Pagination pattern for infinite scrolling.",
    difficulty: "Advanced",
    tags: ["cursor", "infinite-scroll"],
    prisma: `prisma.post.findMany({
  cursor: {
    id: lastPostId
  },
  skip: 1,
  take: 20,
  orderBy: {
    id: "asc"
  }
})`,
    sql: `SELECT *
FROM post
WHERE id > :lastPostId
ORDER BY id ASC
LIMIT 20;`,
  },

  {
    id: "page-one",
    name: "First Page",
    category: "pagination",
    description: "Retrieve the first page of data.",
    difficulty: "Beginner",
    tags: ["page"],
    prisma: `prisma.post.findMany({
  take: 10,
  orderBy: {
    id: "asc"
  }
})`,
    sql: `SELECT *
FROM post
ORDER BY id ASC
LIMIT 10;`,
  },

  {
    id: "page-two",
    name: "Second Page",
    category: "pagination",
    description: "Retrieve the second page of results.",
    difficulty: "Beginner",
    tags: ["page"],
    prisma: `prisma.post.findMany({
  skip: 10,
  take: 10,
  orderBy: {
    id: "asc"
  }
})`,
    sql: `SELECT *
FROM post
ORDER BY id ASC
LIMIT 10
OFFSET 10;`,
  },
];