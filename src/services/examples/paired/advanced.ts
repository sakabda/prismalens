import type { QueryExample } from "../../../types/example";

export const advancedExamples: QueryExample[] = [
  {
    id: "nested-create",
    name: "Nested Create",
    category: "advanced",
    description: "Create a user and related posts in one query.",
    difficulty: "Advanced",
    tags: ["nested", "create", "relation"],
    prisma: `prisma.user.create({
  data: {
    name: "John",
    email: "john@test.com",
    posts: {
      create: [
        {
          title: "First Post"
        },
        {
          title: "Second Post"
        }
      ]
    }
  }
})`,
    sql: `-- Multiple SQL statements inside a transaction

BEGIN;

INSERT INTO user (name, email)
VALUES ('John', 'john@test.com');

INSERT INTO post (title, userId)
VALUES
('First Post', LAST_INSERT_ID()),
('Second Post', LAST_INSERT_ID());

COMMIT;`,
  },

  {
    id: "nested-update",
    name: "Nested Update",
    category: "advanced",
    description: "Update a user and related posts.",
    difficulty: "Advanced",
    tags: ["nested", "update"],
    prisma: `prisma.user.update({
  where: {
    id: 1
  },
  data: {
    posts: {
      update: {
        where: {
          id: 10
        },
        data: {
          title: "Updated Post"
        }
      }
    }
  }
})`,
    sql: `UPDATE post
SET title = 'Updated Post'
WHERE id = 10;`,
  },

  {
    id: "connect",
    name: "Connect Relation",
    category: "advanced",
    description: "Connect an existing relation.",
    difficulty: "Intermediate",
    tags: ["connect"],
    prisma: `prisma.post.create({
  data: {
    title: "Hello",
    author: {
      connect: {
        id: 1
      }
    }
  }
})`,
    sql: `INSERT INTO post (
  title,
  userId
)
VALUES (
  'Hello',
  1
);`,
  },

  {
    id: "connect-or-create",
    name: "Connect Or Create",
    category: "advanced",
    description: "Connect if exists, otherwise create.",
    difficulty: "Advanced",
    tags: ["connectOrCreate"],
    prisma: `prisma.post.create({
  data: {
    title: "Hello",
    author: {
      connectOrCreate: {
        where: {
          email: "john@test.com"
        },
        create: {
          name: "John",
          email: "john@test.com"
        }
      }
    }
  }
})`,
    sql: `-- Usually implemented with
-- INSERT ... ON CONFLICT
-- or MERGE depending on database.`,
  },

  {
    id: "disconnect",
    name: "Disconnect Relation",
    category: "advanced",
    description: "Remove an existing relation.",
    difficulty: "Intermediate",
    tags: ["disconnect"],
    prisma: `prisma.user.update({
  where: {
    id: 1
  },
  data: {
    profile: {
      disconnect: true
    }
  }
})`,
    sql: `UPDATE profile
SET userId = NULL
WHERE userId = 1;`,
  },

  {
    id: "increment",
    name: "Increment",
    category: "advanced",
    description: "Increase a numeric value.",
    difficulty: "Intermediate",
    tags: ["increment"],
    prisma: `prisma.post.update({
  where: {
    id: 1
  },
  data: {
    views: {
      increment: 1
    }
  }
})`,
    sql: `UPDATE post
SET views = views + 1
WHERE id = 1;`,
  },

  {
    id: "decrement",
    name: "Decrement",
    category: "advanced",
    description: "Decrease a numeric value.",
    difficulty: "Intermediate",
    tags: ["decrement"],
    prisma: `prisma.post.update({
  where: {
    id: 1
  },
  data: {
    likes: {
      decrement: 1
    }
  }
})`,
    sql: `UPDATE post
SET likes = likes - 1
WHERE id = 1;`,
  },

  {
    id: "multiply",
    name: "Multiply",
    category: "advanced",
    description: "Multiply a numeric field.",
    difficulty: "Advanced",
    tags: ["multiply"],
    prisma: `prisma.product.update({
  where: {
    id: 1
  },
  data: {
    price: {
      multiply: 1.1
    }
  }
})`,
    sql: `UPDATE product
SET price = price * 1.1
WHERE id = 1;`,
  },

  {
    id: "divide",
    name: "Divide",
    category: "advanced",
    description: "Divide a numeric field.",
    difficulty: "Advanced",
    tags: ["divide"],
    prisma: `prisma.product.update({
  where: {
    id: 1
  },
  data: {
    price: {
      divide: 2
    }
  }
})`,
    sql: `UPDATE product
SET price = price / 2
WHERE id = 1;`,
  },

  {
    id: "transaction",
    name: "Transaction",
    category: "advanced",
    description: "Execute multiple queries in a transaction.",
    difficulty: "Advanced",
    tags: ["transaction"],
    prisma: `await prisma.$transaction([
  prisma.user.create({
    data: {
      name: "Alice"
    }
  }),
  prisma.post.create({
    data: {
      title: "Hello"
    }
  })
]);`,
    sql: `BEGIN;

INSERT INTO user(name)
VALUES('Alice');

INSERT INTO post(title)
VALUES('Hello');

COMMIT;`,
  },

  {
    id: "queryraw",
    name: "$queryRaw",
    category: "advanced",
    description: "Execute raw SQL queries.",
    difficulty: "Advanced",
    tags: ["raw"],
    prisma: `await prisma.$queryRaw\`
SELECT *
FROM user
WHERE role='ADMIN'
\`;`,
    sql: `SELECT *
FROM user
WHERE role='ADMIN';`,
  },

  {
    id: "executeraw",
    name: "$executeRaw",
    category: "advanced",
    description: "Execute raw SQL commands.",
    difficulty: "Advanced",
    tags: ["raw"],
    prisma: `await prisma.$executeRaw\`
UPDATE user
SET role='ADMIN'
WHERE id=1
\`;`,
    sql: `UPDATE user
SET role='ADMIN'
WHERE id=1;`,
  },
];