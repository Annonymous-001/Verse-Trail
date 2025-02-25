import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { signinInput, signupInput } from '@100xdevs/medium-common';
import { cors } from 'hono/cors';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

// Add CORS middleware
userRouter.use('*', cors({
  origin: 'https://verse-trail.vercel.app', // Specify your frontend domain here
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent
}));



userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct" });
  }

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: body.password,
      name: body.name
    },
  });

  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
  const token = await sign(
    { id: user.id, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }, 
    c.env.JWT_SECRET
  );

  // Set token in an HTTP-only cookie
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: true, // Secure only in production
    path: '/',
    sameSite: 'None',
    maxAge: expiresInSeconds
  });

  return c.json({ message: "User signed up successfully" });
});

userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ message: "Inputs are not correct" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password
      }
    });

    if (!user) {
      c.status(403);
      return c.json({ message: "Incorrect Email and Password" });
    }

    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
    const token = await sign(
      { id: user.id, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }, 
      c.env.JWT_SECRET
    );

    // Set token in an HTTP-only cookie
    setCookie(c, 'token', token, {
      httpOnly: true,
      secure: true, // Secure only in production
      path: '/',
      sameSite: 'None',
      maxAge: expiresInSeconds
    });

    return c.json({ message: "User signed in successfully" });
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({ message: "Server error" });
  }
});

// Logout Route (Clears Cookie)
userRouter.post('/logout', async (c) => {
  setCookie(c, 'token', '', {
    path: '/',
    secure: true,
    sameSite: 'None',
    httpOnly: true,
    expires: new Date(0) // Forces expiration
  });

  return c.json({ message: "Logged out successfully" });
});
userRouter.get("/me", async (c) => {
  const token = getCookie(c, "token"); // Get token from cookie

  if (!token) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as { id: string };
    if (!payload.id) {
      throw new Error("Invalid token payload");
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, name: true }, // Select necessary fields
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    return c.json(user);
  } catch (error) {
    c.status(401);
    return c.json({ message: "Invalid token" });
  }
});