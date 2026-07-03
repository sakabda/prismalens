import type { QueryExample } from "../../../types/example";

export const relationExamples: QueryExample[] = [
  {
    id: "include-posts",
    name: "include",
    category: "relations",
    description: "Load related posts for each user.",
    difficulty: "Beginner",
    tags: ["include", "relation", "join"],
    prisma: `prisma.user.findMany({
  include: {
    posts: true
  }
})`,
    sql: `SELECT
  u.*,
  p.*
FROM user u
LEFT JOIN post p
ON p.userId = u.id;`,
  },

  {
    id: "include-profile",
    name: "include one-to-one",
    category: "relations",
    description: "Load the related profile.",
    difficulty: "Beginner",
    tags: ["include", "profile", "left join"],
    prisma: `prisma.user.findMany({
  include: {
    profile: true
  }
})`,
    sql: `SELECT
  u.*,
  p.*
FROM user u
LEFT JOIN profile p
ON p.userId = u.id;`,
  },

  {
    id: "select-fields",
    name: "select",
    category: "relations",
    description: "Select only specific fields.",
    difficulty: "Beginner",
    tags: ["select"],
    prisma: `prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})`,
    sql: `SELECT
  id,
  name,
  email
FROM user;`,
  },

  {
    id: "nested-select",
    name: "nested select",
    category: "relations",
    description: "Select fields from related posts.",
    difficulty: "Intermediate",
    tags: ["select", "relation"],
    prisma: `prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        title: true,
        published: true
      }
    }
  }
})`,
    sql: `SELECT
  u.id,
  u.name,
  p.title,
  p.published
FROM user u
LEFT JOIN post p
ON p.userId = u.id;`,
  },

  {
    id: "include-with-filter",
    name: "include with where",
    category: "relations",
    description: "Include only published posts.",
    difficulty: "Intermediate",
    tags: ["include", "where"],
    prisma: `prisma.user.findMany({
  include: {
    posts: {
      where: {
        published: true
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
AND p.published = true;`,
  },

  {
    id: "include-orderby",
    name: "include with orderBy",
    category: "relations",
    description: "Order related posts.",
    difficulty: "Intermediate",
    tags: ["include", "orderBy"],
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
    id: "include-pagination",
    name: "include with take",
    category: "relations",
    description: "Load only a limited number of related posts.",
    difficulty: "Intermediate",
    tags: ["include", "take"],
    prisma: `prisma.user.findMany({
  include: {
    posts: {
      take: 5
    }
  }
})`,
    sql: `SELECT
  u.*,
  p.*
FROM user u
LEFT JOIN post p
ON p.userId = u.id
LIMIT 5;`,
  },

  {
    id: "deep-include",
    name: "nested include",
    category: "relations",
    description: "Load posts and their comments.",
    difficulty: "Advanced",
    tags: ["nested", "include"],
    prisma: `prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: true
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
ON c.postId = p.id;`,
  },

  {
    id: "relation-count",
    name: "_count",
    category: "relations",
    description: "Count related records.",
    difficulty: "Intermediate",
    tags: ["count", "_count"],
    prisma: `prisma.user.findMany({
  include: {
    _count: {
      select: {
        posts: true
      }
    }
  }
})`,
    sql: `SELECT
  u.*,
  COUNT(p.id) AS posts
FROM user u
LEFT JOIN post p
ON p.userId = u.id
GROUP BY u.id;`,
  },

  {
    id: "relation-filter",
    name: "relation filter",
    category: "relations",
    description: "Find users having published posts.",
    difficulty: "Advanced",
    tags: ["some", "relation"],
    prisma: `prisma.user.findMany({
  where: {
    posts: {
      some: {
        published: true
      }
    }
  }
})`,
    sql: `SELECT DISTINCT
  u.*
FROM user u
INNER JOIN post p
ON p.userId = u.id
WHERE p.published = true;`,
  },
];