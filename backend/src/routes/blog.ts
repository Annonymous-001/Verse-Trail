import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { createBlogInput, updateBlogInput } from '@100xdevs/medium-common';
import { cors } from 'hono/cors';
import { getCookie } from 'hono/cookie'; // Import cookie helper

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// CORS Configuration
blogRouter.use(
  '/*',
  cors({
    origin: 'https://verse-trail.vercel.app',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true, // Allow cookies to be sent
  })
);

// Middleware to verify JWT from cookies
blogRouter.use('/*', async (c, next) => {
  try {
    const jwt = getCookie(c, 'token'); // Get JWT from cookies
    if (!jwt) {
      c.status(401);
      return c.json({ error: 'Unauthorized' });
    }

    const user = await verify(jwt, c.env.JWT_SECRET);
    if (user && typeof user.id === 'string') {
      c.set('userId', user.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: 'You are not logged in' });
    }
  } catch (e) {
    c.status(403);
    return c.json({ message: 'You are not logged in' });
  }
});

// Create Blog Post
blogRouter.post('/create', async (c) => {
  const userId = c.get('userId');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: 'Inputs are not correct' });
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });

  return c.json({ id: post.id });
});

// Update Blog Post
blogRouter.put('/update', async (c) => {
  const userId = c.get('userId');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const parsedInput = updateBlogInput.safeParse(body);

  if (!parsedInput.success) {
    c.status(400);
    return c.json({ message: 'Invalid input', error: parsedInput.error.errors });
  }

  const { id, title, content } = parsedInput.data;

  try {
    await prisma.post.update({
      where: {
        id,
        authorId: userId,
      },
      data: { title, content },
    });

    return c.text('Post updated');
  } catch (error) {
    console.error('Error updating post:', error);
    c.status(500);
    return c.json({ error: 'Failed to update post' });
  }
});

// Fetch All Blog Posts
blogRouter.get('/bulk', async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({
      include: { author: { select: { name: true } } },
    });

    if (!posts.length) {
      return c.json({ message: 'No posts found.' });
    }

    return c.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Fetch Single Blog Post by ID
blogRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!id || isNaN(Number(id))) {
    c.status(400);
    return c.json({ message: 'Invalid or missing post ID' });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: { author: { select: { name: true } } },
    });

    if (!post) {
      c.status(404);
      return c.json({ message: 'Post not found' });
    }

    return c.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    c.status(500);
    return c.json({ error: 'Failed to fetch post' });
  }
});
