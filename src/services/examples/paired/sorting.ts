import type { QueryExample } from "../../../types/example";

export const sortingExamples: QueryExample[] = [
  {
    id: "orderby-asc",
    name: "orderBy ASC",
    category: "sorting",
    description: "Sort users by name in ascending order.",
    difficulty: "Beginner",
    tags: ["orderBy", "asc"],
    prisma: `prisma.user.findMany({
  orderBy: {
    name: "asc"
  }
})`,
    sql: `SELECT *
FROM user
ORDER BY name ASC;`,
  },

  {
    id: "orderby-desc",
    name: "orderBy DESC",
    category: "sorting",
    description: "Sort users by creation date in descending order.",
    difficulty: "Beginner",
    tags: ["orderBy", "desc"],
    prisma: `prisma.user.findMany({
  orderBy: {
    createdAt: "desc"
  }
})`,
    sql: `SELECT *
FROM user
ORDER BY createdAt DESC;`,
  },

  {
    id: "multiple-orderby",
    name: "Multiple orderBy",
    category: "sorting",
    description: "Sort by multiple columns.",
    difficulty: "Intermediate",
    tags: ["orderBy", "multiple"],
    prisma: `prisma.post.findMany({
  orderBy: [
    {
      published: "desc"
    },
    {
      createdAt: "desc"
    }
  ]
})`,
    sql: `SELECT *
FROM post
ORDER BY
  published DESC,
  createdAt DESC;`,
  },

  {
    id: "relation-orderby",
    name: "Relation orderBy",
    category: "sorting",
    description: "Sort users by their related posts.",
    difficulty: "Intermediate",
    tags: ["relation", "orderBy"],
    prisma: `prisma.user.findMany({
  include: {
    posts: {
      orderBy: {
        createdAt: "desc"
      }
    }
  }
})`,
    sql: `SELECT
  u.*,
  p.*
FROM user u
LEFT JOIN post p
ON p.userId = u.id
ORDER BY p.createdAt DESC;`,
  },

  {
    id: "count-orderby",
    name: "Sort by relation count",
    category: "sorting",
    description: "Sort users by the number of posts.",
    difficulty: "Advanced",
    tags: ["_count", "relation"],
    prisma: `prisma.user.findMany({
  orderBy: {
    posts: {
      _count: "desc"
    }
  }
})`,
    sql: `SELECT
  u.*,
  COUNT(p.id) AS totalPosts
FROM user u
LEFT JOIN post p
ON p.userId = u.id
GROUP BY u.id
ORDER BY totalPosts DESC;`,
  },

  {
    id: "aggregate-orderby",
    name: "Aggregate orderBy",
    category: "sorting",
    description: "Sort grouped records by aggregate value.",
    difficulty: "Advanced",
    tags: ["groupBy", "_sum"],
    prisma: `prisma.post.groupBy({
  by: ["authorId"],
  _sum: {
    views: true
  },
  orderBy: {
    _sum: {
      views: "desc"
    }
  }
})`,
    sql: `SELECT
  authorId,
  SUM(views) AS totalViews
FROM post
GROUP BY authorId
ORDER BY totalViews DESC;`,
  },

  {
    id: "nested-orderby",
    name: "Nested relation orderBy",
    category: "sorting",
    description: "Sort nested comments by creation date.",
    difficulty: "Advanced",
    tags: ["nested", "orderBy"],
    prisma: `prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    }
  }
})`,
    sql: `SELECT
  u.*,
  p.*,
  c.*
FROM user u
LEFT JOIN post p
ON p.userId = u.id
LEFT JOIN comment c
ON c.postId = p.id
ORDER BY c.createdAt DESC;`,
  },

  {
    id: "case-insensitive-order",
    name: "Case-insensitive sorting",
    category: "sorting",
    description: "Sort values ignoring letter case.",
    difficulty: "Advanced",
    tags: ["orderBy", "lower"],
    prisma: `// Prisma currently relies on database collation
// for case-insensitive ordering.`,
    sql: `SELECT *
FROM user
ORDER BY LOWER(name);`,
  },
];