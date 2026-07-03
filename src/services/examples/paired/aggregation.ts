import type { QueryExample } from "../../../types/example";

export const aggregationExamples: QueryExample[] = [
  {
    id: "count-all",
    name: "count()",
    category: "aggregation",
    description: "Count all matching records.",
    difficulty: "Beginner",
    tags: ["count"],
    prisma: `prisma.user.count()`,
    sql: `SELECT COUNT(*)
FROM user;`,
  },

  {
    id: "count-where",
    name: "count with where",
    category: "aggregation",
    description: "Count filtered records.",
    difficulty: "Beginner",
    tags: ["count", "where"],
    prisma: `prisma.user.count({
  where: {
    role: "ADMIN"
  }
})`,
    sql: `SELECT COUNT(*)
FROM user
WHERE role = 'ADMIN';`,
  },

  {
    id: "aggregate-count",
    name: "_count",
    category: "aggregation",
    description: "Count selected fields.",
    difficulty: "Intermediate",
    tags: ["aggregate", "_count"],
    prisma: `prisma.post.aggregate({
  _count: {
    id: true
  }
})`,
    sql: `SELECT COUNT(id)
FROM post;`,
  },

  {
    id: "aggregate-sum",
    name: "_sum",
    category: "aggregation",
    description: "Calculate the total of numeric values.",
    difficulty: "Intermediate",
    tags: ["sum"],
    prisma: `prisma.post.aggregate({
  _sum: {
    views: true,
    likes: true
  }
})`,
    sql: `SELECT
  SUM(views),
  SUM(likes)
FROM post;`,
  },

  {
    id: "aggregate-avg",
    name: "_avg",
    category: "aggregation",
    description: "Calculate average values.",
    difficulty: "Intermediate",
    tags: ["avg"],
    prisma: `prisma.post.aggregate({
  _avg: {
    views: true
  }
})`,
    sql: `SELECT AVG(views)
FROM post;`,
  },

  {
    id: "aggregate-min",
    name: "_min",
    category: "aggregation",
    description: "Find the minimum value.",
    difficulty: "Intermediate",
    tags: ["min"],
    prisma: `prisma.post.aggregate({
  _min: {
    createdAt: true
  }
})`,
    sql: `SELECT MIN(createdAt)
FROM post;`,
  },

  {
    id: "aggregate-max",
    name: "_max",
    category: "aggregation",
    description: "Find the maximum value.",
    difficulty: "Intermediate",
    tags: ["max"],
    prisma: `prisma.post.aggregate({
  _max: {
    createdAt: true
  }
})`,
    sql: `SELECT MAX(createdAt)
FROM post;`,
  },

  {
    id: "aggregate-all",
    name: "Full aggregate",
    category: "aggregation",
    description: "Use multiple aggregate functions together.",
    difficulty: "Advanced",
    tags: ["aggregate", "sum", "avg", "count"],
    prisma: `prisma.post.aggregate({
  where: {
    published: true
  },
  _count: {
    id: true
  },
  _sum: {
    views: true
  },
  _avg: {
    views: true
  },
  _min: {
    createdAt: true
  },
  _max: {
    createdAt: true
  }
})`,
    sql: `SELECT
  COUNT(id),
  SUM(views),
  AVG(views),
  MIN(createdAt),
  MAX(createdAt)
FROM post
WHERE published = true;`,
  },

  {
    id: "groupby-basic",
    name: "groupBy",
    category: "aggregation",
    description: "Group posts by author.",
    difficulty: "Advanced",
    tags: ["groupBy"],
    prisma: `prisma.post.groupBy({
  by: ["authorId"],
  _count: {
    id: true
  }
})`,
    sql: `SELECT
  authorId,
  COUNT(id)
FROM post
GROUP BY authorId;`,
  },

  {
    id: "groupby-sum",
    name: "groupBy with sum",
    category: "aggregation",
    description: "Calculate totals for each group.",
    difficulty: "Advanced",
    tags: ["groupBy", "_sum"],
    prisma: `prisma.post.groupBy({
  by: ["authorId"],
  _sum: {
    views: true
  }
})`,
    sql: `SELECT
  authorId,
  SUM(views)
FROM post
GROUP BY authorId;`,
  },

  {
    id: "groupby-order",
    name: "groupBy orderBy",
    category: "aggregation",
    description: "Sort grouped results.",
    difficulty: "Advanced",
    tags: ["groupBy", "orderBy"],
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
    id: "groupby-having",
    name: "groupBy having",
    category: "aggregation",
    description: "Filter grouped records.",
    difficulty: "Advanced",
    tags: ["groupBy", "having"],
    prisma: `prisma.post.groupBy({
  by: ["authorId"],
  _sum: {
    views: true
  },
  having: {
    views: {
      _sum: {
        gt: 1000
      }
    }
  }
})`,
    sql: `SELECT
  authorId,
  SUM(views) AS totalViews
FROM post
GROUP BY authorId
HAVING SUM(views) > 1000;`,
  },

  {
    id: "distinct",
    name: "distinct",
    category: "aggregation",
    description: "Return distinct values.",
    difficulty: "Intermediate",
    tags: ["distinct"],
    prisma: `prisma.post.findMany({
  distinct: ["authorId"]
})`,
    sql: `SELECT DISTINCT authorId
FROM post;`,
  },
];