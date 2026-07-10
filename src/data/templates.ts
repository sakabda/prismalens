import { QuerySchema } from '../types';

export const BLOG_SCHEMA: QuerySchema = {
  models: [
    {
      name: 'User',
      dbName: 'users',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'email', type: 'String', dbName: 'email_address' },
        { name: 'name', type: 'String' },
        { name: 'role', type: 'String' },
        { name: 'posts', type: 'Post', isRelation: true, relationModel: 'Post' }
      ]
    },
    {
      name: 'Post',
      dbName: 'posts',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'title', type: 'String' },
        { name: 'content', type: 'String' },
        { name: 'published', type: 'Boolean' },
        { name: 'authorId', type: 'Int', dbName: 'author_id' },
        { name: 'author', type: 'User', isRelation: true, relationModel: 'User', relationFields: ['authorId'], relationReferences: ['id'] },
        { name: 'comments', type: 'Comment', isRelation: true, relationModel: 'Comment' },
        { name: 'tags', type: 'TagOnPost', isRelation: true, relationModel: 'TagOnPost' }
      ]
    },
    {
      name: 'Comment',
      dbName: 'comments',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'text', type: 'String', dbName: 'comment_text' },
        { name: 'postId', type: 'Int', dbName: 'post_id' },
        { name: 'post', type: 'Post', isRelation: true, relationModel: 'Post', relationFields: ['postId'], relationReferences: ['id'] },
        { name: 'authorId', type: 'Int', dbName: 'author_id' },
        { name: 'author', type: 'User', isRelation: true, relationModel: 'User', relationFields: ['authorId'], relationReferences: ['id'] }
      ]
    },
    {
      name: 'TagOnPost',
      dbName: 'tags_on_posts',
      fields: [
        { name: 'postId', type: 'Int', dbName: 'post_id' },
        { name: 'tagId', type: 'Int', dbName: 'tag_id' },
        { name: 'post', type: 'Post', isRelation: true, relationModel: 'Post', relationFields: ['postId'], relationReferences: ['id'] }
      ]
    }
  ]
};

export const ECOMMERCE_SCHEMA: QuerySchema = {
  models: [
    {
      name: 'Customer',
      dbName: 'customers',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'email', type: 'String' },
        { name: 'fullName', type: 'String', dbName: 'full_name' },
        { name: 'orders', type: 'Order', isRelation: true, relationModel: 'Order' }
      ]
    },
    {
      name: 'Order',
      dbName: 'orders',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'totalAmount', type: 'Float', dbName: 'total_amount' },
        { name: 'status', type: 'String' },
        { name: 'customerId', type: 'Int', dbName: 'customer_id' },
        { name: 'customer', type: 'Customer', isRelation: true, relationModel: 'Customer', relationFields: ['customerId'], relationReferences: ['id'] },
        { name: 'items', type: 'OrderItem', isRelation: true, relationModel: 'OrderItem' }
      ]
    },
    {
      name: 'OrderItem',
      dbName: 'order_items',
      fields: [
        { name: 'id', type: 'Int', isId: true },
        { name: 'quantity', type: 'Int' },
        { name: 'price', type: 'Float' },
        { name: 'orderId', type: 'Int', dbName: 'order_id' },
        { name: 'order', type: 'Order', isRelation: true, relationModel: 'Order', relationFields: ['orderId'], relationReferences: ['id'] },
        { name: 'productId', type: 'Int', dbName: 'product_id' }
      ]
    }
  ]
};

export const PRISMA_TEMPLATES = [
  {
    name: 'Deep Relational Fetch (Blog Users, Posts & Comments)',
    code: `prisma.user.findMany({
  where: {
    role: 'AUTHOR',
    posts: {
      some: {
        published: true
      }
    }
  },
  select: {
    id: true,
    email: true,
    name: true,
    posts: {
      select: {
        id: true,
        title: true,
        comments: {
          select: {
            id: true,
            text: true
          }
        }
      }
    }
  },
  orderBy: {
    name: 'desc'
  },
  take: 10,
  skip: 0
})`
  },
  {
    name: 'Compound Filter Criteria with Negations',
    code: `prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      { title: { contains: 'Prisma' } }
    ],
    OR: [
      { authorId: { gte: 100 } },
      { comments: { none: { authorId: 5 } } }
    ],
    NOT: {
      content: { startsWith: 'Draft' }
    }
  },
  include: {
    author: true,
    comments: true
  }
})`
  },
  {
    name: 'E-commerce Customers with Order Items',
    code: `prisma.customer.findMany({
  where: {
    email: { endsWith: '@gmail.com' }
  },
  select: {
    fullName: true,
    orders: {
      where: {
        status: 'DELIVERED'
      },
      select: {
        totalAmount: true,
        items: true
      }
    }
  }
})`
  }
];

export const SQL_TEMPLATES = [
  {
    name: 'Full Join Profile and User Paging',
    code: `SELECT
  u.id,
  u.email_address AS user_email,
  p.title AS post_title,
  c.comment_text AS comment_content
FROM users AS u
LEFT JOIN posts AS p ON u.id = p.author_id
LEFT JOIN comments AS c ON p.id = c.post_id
WHERE u.role = 'ADMIN' AND p.published = true
ORDER BY u.name DESC
LIMIT 50
OFFSET 0;`
  },
  {
    name: 'Strict Subquery/Filter with Wildcards',
    code: `SELECT
  posts.id,
  posts.title
FROM posts AS posts
WHERE posts.published = true 
  AND posts.title LIKE '%Relational%'
ORDER BY posts.id ASC;`
  }
];
