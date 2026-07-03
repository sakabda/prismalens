import type { QueryExample } from "../../../types/example";

export const basicExamples: QueryExample[] = [
  {
    id: "findMany-basic",

    name: "findMany",

    description: "Fetch all admin users",

    category: "basic",

    difficulty: "Beginner",

    tags: [
      "findMany",
      "where",
      "select",
    ],

    prisma: `prisma.user.findMany({
  where: {
    role: "ADMIN"
  }
})`,

    sql: `SELECT *
FROM user
WHERE role = 'ADMIN';`,
  },

  {
    id: "findUnique-id",

    name: "findUnique",

    description: "Find user by ID",

    category: "basic",

    difficulty: "Beginner",

    tags: [
      "findUnique",
      "where",
      "primary-key",
    ],

    prisma: `prisma.user.findUnique({
  where: {
    id: 1
  }
})`,

    sql: `SELECT *
FROM user
WHERE id = 1
LIMIT 1;`,
  },

  {
    id: "findFirst-email",

    name: "findFirst",

    description: "Find first matching email",

    category: "basic",

    difficulty: "Beginner",

    tags: [
      "findFirst",
      "email",
    ],

    prisma: `prisma.user.findFirst({
  where: {
    email: "test@test.com"
  }
})`,

    sql: `SELECT *
FROM user
WHERE email = 'test@test.com'
LIMIT 1;`,
  },
];