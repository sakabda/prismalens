import type { QueryExample } from "../../types";

export const queryExamples: QueryExample[] = [
  {
    name: "findMany",
    category: "basic",
    query: `prisma.user.findMany({
  where: {
    role: "ADMIN"
  }
})`,
    description: "Fetch all admin users",
  },
  {
    name: "findUnique",
    category: "basic",
    query: `prisma.user.findUnique({
  where: {
    id: 1
  }
})`,
    description: "Find user by unique ID",
  },
  {
    name: "findFirst",
    category: "basic",
    query: `prisma.user.findFirst({
  where: {
    email: "test@test.com"
  }
})`,
    description: "Get first matching user",
  },
  {
    name: "create",
    category: "crud",
    query: `prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    role: "USER"
  }
})`,
    description: "Create a new user",
  },
  {
    name: "update",
    category: "crud",
    query: `prisma.user.update({
  where: {
    id: 1
  },
  data: {
    name: "Jane Doe",
    role: "ADMIN"
  }
})`,
    description: "Update user by ID",
  },
  {
    name: "delete",
    category: "crud",
    query: `prisma.user.delete({
  where: {
    id: 1
  }
})`,
    description: "Delete user by ID",
  },
  {
    name: "upsert",
    category: "crud",
    query: `prisma.user.upsert({
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
    description: "Insert or update user",
  },
  {
    name: "equals & in",
    category: "filtering",
    query: `prisma.user.findMany({
  where: {
    role: {
      equals: "ADMIN"
    },
    id: {
      in: [1, 2, 3, 4, 5]
    }
  }
})`,
    description: "Filter with equals and in",
  },
  {
    name: "comparison operators",
    category: "filtering",
    query: `prisma.post.findMany({
  where: {
    views: {
      gt: 100,
      lte: 10000
    },
    createdAt: {
      gte: new Date("2024-01-01")
    }
  }
})`,
    description: "gt, lte, gte filters",
  },
  {
    name: "string filters",
    category: "filtering",
    query: `prisma.user.findMany({
  where: {
    name: {
      contains: "John",
      mode: "insensitive"
    },
    email: {
      startsWith: "admin",
      endsWith: "@company.com"
    }
  }
})`,
    description: "contains, startsWith, endsWith",
  },
  {
    name: "AND / OR / NOT",
    category: "filtering",
    query: `prisma.user.findMany({
  where: {
    AND: [
      { role: "ADMIN" },
      {
        OR: [
          { name: { contains: "John" } },
          { email: { contains: "john" } }
        ]
      }
    ],
    NOT: {
      status: "SUSPENDED"
    }
  }
})`,
    description: "Logical operators combined",
  },
  {
    name: "notIn & null",
    category: "filtering",
    query: `prisma.user.findMany({
  where: {
    id: {
      notIn: [1, 2, 3]
    },
    deletedAt: null
  }
})`,
    description: "Exclude values and filter null",
  },
  {
    name: "include relations",
    category: "relations",
    query: `prisma.user.findMany({
  where: {
    id: 1
  },
  include: {
    posts: {
      where: {
        published: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    },
    profile: true
  }
})`,
    description: "Load related posts and profile",
  },
  {
    name: "nested include",
    category: "relations",
    query: `prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true
          }
        },
        tags: true
      }
    }
  }
})`,
    description: "Deep nested relation loading",
  },
  {
    name: "select fields",
    category: "relations",
    query: `prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    posts: {
      select: {
        title: true,
        published: true
      }
    }
  }
})`,
    description: "Select specific fields with relations",
  },
  {
    name: "orderBy",
    category: "sorting",
    query: `prisma.post.findMany({
  orderBy: {
    createdAt: "desc"
  }
})`,
    description: "Sort by date descending",
  },
  {
    name: "multi-field orderBy",
    category: "sorting",
    query: `prisma.post.findMany({
  orderBy: [
    { published: "desc" },
    { createdAt: "desc" }
  ]
})`,
    description: "Sort by multiple fields",
  },
  {
    name: "pagination",
    category: "pagination",
    query: `prisma.post.findMany({
  skip: 20,
  take: 10,
  orderBy: {
    createdAt: "desc"
  }
})`,
    description: "Offset-based pagination",
  },
  {
    name: "cursor pagination",
    category: "pagination",
    query: `prisma.post.findMany({
  take: 10,
  cursor: {
    id: 20
  },
  skip: 1,
  orderBy: {
    id: "asc"
  }
})`,
    description: "Cursor-based pagination",
  },
  {
    name: "count",
    category: "aggregation",
    query: `prisma.user.count({
  where: {
    role: "ADMIN"
  }
})`,
    description: "Count users by role",
  },
  {
    name: "aggregate",
    category: "aggregation",
    query: `prisma.post.aggregate({
  where: {
    published: true
  },
  _count: {
    id: true
  },
  _sum: {
    views: true,
    likes: true
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
    description: "Full aggregation example",
  },
  {
    name: "groupBy",
    category: "aggregation",
    query: `prisma.post.groupBy({
  by: ["authorId"],
  _count: {
    id: true
  },
  _sum: {
    views: true
  },
  orderBy: {
    _sum: {
      views: "desc"
    }
  },
  take: 10
})`,
    description: "Group posts by author",
  },
  {
    name: "createMany",
    category: "advanced",
    query: `prisma.user.createMany({
  data: [
    { name: "Alice", email: "alice@test.com" },
    { name: "Bob", email: "bob@test.com" },
    { name: "Carol", email: "carol@test.com" }
  ],
  skipDuplicates: true
})`,
    description: "Batch insert users",
  },
  {
    name: "updateMany",
    category: "advanced",
    query: `prisma.user.updateMany({
  where: {
    role: "MEMBER"
  },
  data: {
    role: "USER"
  }
})`,
    description: "Update multiple users",
  },
  {
    name: "deleteMany",
    category: "advanced",
    query: `prisma.session.deleteMany({
  where: {
    expiresAt: {
      lt: new Date()
    }
  }
})`,
    description: "Delete expired sessions",
  },
  {
    name: "numeric increments",
    category: "advanced",
    query: `prisma.post.update({
  where: {
    id: 1
  },
  data: {
    views: {
      increment: 1
    },
    likes: {
      decrement: 1
    }
  }
})`,
    description: "Increment and decrement fields",
  },
  {
    name: "nested create",
    category: "advanced",
    query: `prisma.user.create({
  data: {
    name: "John",
    email: "john@test.com",
    posts: {
      create: {
        title: "First Post",
        content: "Hello World"
      }
    }
  }
})`,
    description: "Create user with nested post",
  },
];
