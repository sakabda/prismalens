import type { QueryExample } from "../../../types/example";

export const filteringExamples: QueryExample[] = [
  {
    id: "filter-equals",
    name: "equals",
    category: "filtering",
    description: "Filter records using equals.",
    difficulty: "Beginner",
    tags: ["where", "equals"],
    prisma: `prisma.user.findMany({
  where: {
    role: {
      equals: "ADMIN"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE role = 'ADMIN';`,
  },

  {
    id: "filter-not",
    name: "not",
    category: "filtering",
    description: "Exclude matching values.",
    difficulty: "Beginner",
    tags: ["where", "not"],
    prisma: `prisma.user.findMany({
  where: {
    role: {
      not: "ADMIN"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE role <> 'ADMIN';`,
  },

  {
    id: "filter-in",
    name: "in",
    category: "filtering",
    description: "Match multiple values.",
    difficulty: "Beginner",
    tags: ["in"],
    prisma: `prisma.user.findMany({
  where: {
    id: {
      in: [1,2,3]
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE id IN (1,2,3);`,
  },

  {
    id: "filter-notin",
    name: "notIn",
    category: "filtering",
    description: "Exclude multiple values.",
    difficulty: "Beginner",
    tags: ["notIn"],
    prisma: `prisma.user.findMany({
  where: {
    id: {
      notIn: [1,2,3]
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE id NOT IN (1,2,3);`,
  },

  {
    id: "filter-gt",
    name: "greater than",
    category: "filtering",
    description: "Greater than comparison.",
    difficulty: "Beginner",
    tags: ["gt"],
    prisma: `prisma.post.findMany({
  where: {
    views: {
      gt: 100
    }
  }
})`,
    sql: `SELECT *
FROM post
WHERE views > 100;`,
  },

  {
    id: "filter-gte",
    name: "greater than or equal",
    category: "filtering",
    description: "Greater than or equal comparison.",
    difficulty: "Beginner",
    tags: ["gte"],
    prisma: `prisma.post.findMany({
  where: {
    views: {
      gte: 100
    }
  }
})`,
    sql: `SELECT *
FROM post
WHERE views >= 100;`,
  },

  {
    id: "filter-lt",
    name: "less than",
    category: "filtering",
    description: "Less than comparison.",
    difficulty: "Beginner",
    tags: ["lt"],
    prisma: `prisma.post.findMany({
  where: {
    views: {
      lt: 100
    }
  }
})`,
    sql: `SELECT *
FROM post
WHERE views < 100;`,
  },

  {
    id: "filter-lte",
    name: "less than or equal",
    category: "filtering",
    description: "Less than or equal comparison.",
    difficulty: "Beginner",
    tags: ["lte"],
    prisma: `prisma.post.findMany({
  where: {
    views: {
      lte: 100
    }
  }
})`,
    sql: `SELECT *
FROM post
WHERE views <= 100;`,
  },

  {
    id: "filter-contains",
    name: "contains",
    category: "filtering",
    description: "Find values containing text.",
    difficulty: "Intermediate",
    tags: ["contains"],
    prisma: `prisma.user.findMany({
  where: {
    name: {
      contains: "John"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE name LIKE '%John%';`,
  },

  {
    id: "filter-startswith",
    name: "startsWith",
    category: "filtering",
    description: "Starts with filter.",
    difficulty: "Intermediate",
    tags: ["startsWith"],
    prisma: `prisma.user.findMany({
  where: {
    email: {
      startsWith: "admin"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE email LIKE 'admin%';`,
  },

  {
    id: "filter-endswith",
    name: "endsWith",
    category: "filtering",
    description: "Ends with filter.",
    difficulty: "Intermediate",
    tags: ["endsWith"],
    prisma: `prisma.user.findMany({
  where: {
    email: {
      endsWith: ".com"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE email LIKE '%.com';`,
  },

  {
    id: "filter-null",
    name: "null",
    category: "filtering",
    description: "Find NULL values.",
    difficulty: "Beginner",
    tags: ["null"],
    prisma: `prisma.user.findMany({
  where: {
    deletedAt: null
  }
})`,
    sql: `SELECT *
FROM user
WHERE deletedAt IS NULL;`,
  },

  {
    id: "filter-not-null",
    name: "not null",
    category: "filtering",
    description: "Find NOT NULL values.",
    difficulty: "Beginner",
    tags: ["not", "null"],
    prisma: `prisma.user.findMany({
  where: {
    deletedAt: {
      not: null
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE deletedAt IS NOT NULL;`,
  },

  {
    id: "filter-and",
    name: "AND",
    category: "filtering",
    description: "Combine filters with AND.",
    difficulty: "Intermediate",
    tags: ["AND"],
    prisma: `prisma.user.findMany({
  where: {
    AND: [
      {
        role: "ADMIN"
      },
      {
        status: "ACTIVE"
      }
    ]
  }
})`,
    sql: `SELECT *
FROM user
WHERE role='ADMIN'
AND status='ACTIVE';`,
  },

  {
    id: "filter-or",
    name: "OR",
    category: "filtering",
    description: "Combine filters with OR.",
    difficulty: "Intermediate",
    tags: ["OR"],
    prisma: `prisma.user.findMany({
  where: {
    OR: [
      {
        role: "ADMIN"
      },
      {
        role: "MODERATOR"
      }
    ]
  }
})`,
    sql: `SELECT *
FROM user
WHERE role='ADMIN'
OR role='MODERATOR';`,
  },

  {
    id: "filter-not-operator",
    name: "NOT",
    category: "filtering",
    description: "Negate a condition.",
    difficulty: "Intermediate",
    tags: ["NOT"],
    prisma: `prisma.user.findMany({
  where: {
    NOT: {
      status: "SUSPENDED"
    }
  }
})`,
    sql: `SELECT *
FROM user
WHERE NOT status='SUSPENDED';`,
  },

  {
    id: "filter-combined",
    name: "Complex filtering",
    category: "filtering",
    description: "Nested AND/OR filtering.",
    difficulty: "Advanced",
    tags: ["AND", "OR", "Nested"],
    prisma: `prisma.user.findMany({
  where: {
    AND: [
      {
        role: "ADMIN"
      },
      {
        OR: [
          {
            age: {
              gt: 25
            }
          },
          {
            city: "London"
          }
        ]
      }
    ]
  }
})`,
    sql: `SELECT *
FROM user
WHERE role='ADMIN'
AND (
    age > 25
    OR city='London'
);`,
  },
];