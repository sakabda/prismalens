import type { QueryExample } from "../../../types/example";

export const crudExamples: QueryExample[] = [
  {
    id: "create-user",

    name: "create",

    category: "crud",

    description: "Create a new user.",

    difficulty: "Beginner",

    tags: [
      "create",
      "insert",
      "data",
    ],

    prisma: `prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    role: "USER"
  }
})`,

    sql: `INSERT INTO user (
  name,
  email,
  role
)
VALUES (
  'John Doe',
  'john@example.com',
  'USER'
);`,
  },

  {
    id: "update-user",

    name: "update",

    category: "crud",

    description: "Update a user by primary key.",

    difficulty: "Beginner",

    tags: [
      "update",
      "where",
    ],

    prisma: `prisma.user.update({
  where: {
    id: 1
  },
  data: {
    name: "Jane Doe",
    role: "ADMIN"
  }
})`,

    sql: `UPDATE user
SET
  name = 'Jane Doe',
  role = 'ADMIN'
WHERE id = 1;`,
  },

  {
    id: "delete-user",

    name: "delete",

    category: "crud",

    description: "Delete a user by ID.",

    difficulty: "Beginner",

    tags: [
      "delete",
      "where",
    ],

    prisma: `prisma.user.delete({
  where: {
    id: 1
  }
})`,

    sql: `DELETE FROM user
WHERE id = 1;`,
  },

  {
    id: "upsert-user",

    name: "upsert",

    category: "crud",

    description: "Insert or update a user depending on existence.",

    difficulty: "Advanced",

    tags: [
      "upsert",
      "insert",
      "update",
    ],

    prisma: `prisma.user.upsert({
  where: {
    email: "john@example.com"
  },
  update: {
    name: "John Updated"
  },
  create: {
    name: "John New",
    email: "john@example.com"
  }
})`,

    sql: `-- PostgreSQL example

INSERT INTO user (
  name,
  email
)
VALUES (
  'John New',
  'john@example.com'
)
ON CONFLICT (email)
DO UPDATE
SET name = 'John Updated';`,
  },

  {
    id: "create-many-users",

    name: "createMany",

    category: "crud",

    description: "Insert multiple users in one query.",

    difficulty: "Intermediate",

    tags: [
      "createMany",
      "bulk",
      "insert",
    ],

    prisma: `prisma.user.createMany({
  data: [
    {
      name: "Alice",
      email: "alice@test.com"
    },
    {
      name: "Bob",
      email: "bob@test.com"
    },
    {
      name: "Carol",
      email: "carol@test.com"
    }
  ]
})`,

    sql: `INSERT INTO user (
  name,
  email
)
VALUES
(
  'Alice',
  'alice@test.com'
),
(
  'Bob',
  'bob@test.com'
),
(
  'Carol',
  'carol@test.com'
);`,
  },

  {
    id: "update-many-users",

    name: "updateMany",

    category: "crud",

    description: "Update all matching records.",

    difficulty: "Intermediate",

    tags: [
      "updateMany",
      "bulk",
    ],

    prisma: `prisma.user.updateMany({
  where: {
    role: "MEMBER"
  },
  data: {
    role: "USER"
  }
})`,

    sql: `UPDATE user
SET role = 'USER'
WHERE role = 'MEMBER';`,
  },

  {
    id: "delete-many-users",

    name: "deleteMany",

    category: "crud",

    description: "Delete all matching records.",

    difficulty: "Intermediate",

    tags: [
      "deleteMany",
      "bulk",
    ],

    prisma: `prisma.user.deleteMany({
  where: {
    role: "GUEST"
  }
})`,

    sql: `DELETE FROM user
WHERE role = 'GUEST';`,
  },
];