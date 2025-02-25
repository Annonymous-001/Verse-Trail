
import { Hono } from 'hono';
import {  verify } from 'hono/jwt'
import {  PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { createBlogInput, updateBlogInput } from '@100xdevs/medium-common';
import { cors } from 'hono/cors';
 

export const blogRouter = new Hono<{
	Bindings:{
		DATABASE_URL:string,
		JWT_SECRET:string
	},
	Variables:{
		userId:string
	}
}>();
blogRouter.use('/*', cors({
	origin: 'https://verse-trail.vercel.app',  // You can specify your frontend domain here, e.g., 'http://localhost:3000'
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Authorization', 'Content-Type']
  }));
blogRouter.use('/*', async (c, next) => {
	
	const jwt = c.req.header('Authorization');
	try{
		if (!jwt) {
			c.status(401);
			return c.json({ error: "unauthorized" });
		}
		const token = jwt.split(' ')[1];
		const user = await verify(token, c.env.JWT_SECRET);
		if (user && typeof user.id === 'string') {
			c.set('userId', user.id);
			await next();
		}
		else{
			c.status(403);
			return c.json({
				message:"you are not logged in "
			})
		}
		
	} catch(e)
	{ 
		c.status(403);
		return c.json({
			message:"you are not logged in "
		})
	}
	
})
blogRouter.post("/create", async (c)=>{
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate())
	const body=  await c.req.json();
	const {success} = createBlogInput.safeParse(body);
	if(!success)
	{
		c.status(411)
		return c.json({
			message:"Inputs are not correct"
		})
	}
	const post = await prisma.post.create({
		data:{
			title:body.title,
			content:body.content,
			authorId:userId
		}
	});
	return c.json({
		id:post.id
	});
	
})
blogRouter.put("/update", async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
	  datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const body = await c.req.json();
  
	// Validate input using Zod
	const parsedInput = updateBlogInput.safeParse(body);
	if (!parsedInput.success) {
	  c.status(400); // 400 Bad Request
	  return c.json({
		message: "Invalid input",
		error: parsedInput.error.errors // Show validation errors
	  });
	}
  
	const { id, title, content } = parsedInput.data;
  
	try {
	  // Attempt to update the post
	  const updatedPost = await prisma.post.update({
		where: {
		  id,
		  authorId: userId,
		},
		data: {
		  title,
		  content,
		},
	  });
  
	  return c.text("Post updated");
	} catch (error) {
	  console.error("Error updating post:", error);
	  c.status(500); // 500 Internal Server Error
	  return c.json({ error: "Failed to update post" });
	}
  });
  
blogRouter.get("/bulk", async (c) => {
	try {
	  // Initialize Prisma Client with error handling
	  const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	  }).$extends(withAccelerate());
  
	  // Fetch all posts
	  const posts = await prisma.post.findMany({
		include:{
			author:{
				select:{
					name:true,
				},
			},
		},
	  });
  
	  if (!posts || posts.length === 0) {
		return c.json({ message: "No posts found." });
	  }
  
	  return c.json(posts);
	} catch (error) {
	  console.error("Error fetching posts:", error);
	  return c.json({ error: "Failed to fetch posts" }, 500);
	}
  });
  blogRouter.get("/:id", async (c) => {
	// Retrieve the `id` parameter from the URL
	const id = c.req.param('id');
	
	// Check if the `id` is provided and is a valid number
	if (!id || isNaN(Number(id))) {
	  c.status(400); // Bad Request
	  return c.json({ message: "Invalid or missing post ID" });
	}
  
	const prisma = new PrismaClient({
	  datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  
	try {
	  // Find the post by its `id`, ensuring it's the correct type (number)
	  const post = await prisma.post.findUnique({
		where: {
		  id: Number(id), // Convert `id` to a number
		},
			include:{
				author:{
					select:{
						name:true,
					},
				},
			},
	  });
  
	  // If no post is found, return a 404 error
	  if (!post) {
		c.status(404); // Not Found
		return c.json({ message: "Post not found" });
	  }
  
	  // Return the found post as JSON
	  return c.json(post);
	} catch (error) {
	  console.error("Error fetching post:", error);
	  c.status(500); // Internal Server Error
	  return c.json({ error: "Failed to fetch post" });
	}
  });
  