"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Appbar from "@/components/component/Appbar";
import { BACKEND_URL } from "@/app/config";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedDate: string;
}

export default function BlogPost() {
  const { id } = useParams(); // Extract the blog post ID from params
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const token = sessionStorage.getItem("Token");
        if (!token) throw new Error("User is not authenticated");

        const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBlogPost(response.data);
      } catch (error) {
        setError((error as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlogPost();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Appbar />
        <h1 className="text-3xl font-bold mb-8">Loading Blog Post...</h1>
        <Card className="animate-pulse">
          <CardHeader>
            <CardTitle className="bg-gray-700 h-6 rounded"></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-700 h-4 mb-4 rounded"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="bg-gray-700 h-4 w-24 rounded"></div>
              </div>
              <div className="bg-gray-700 h-4 w-16 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Appbar />
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!blogPost) return null; // Handle the case when no blog post is found

  return (
    <div className="container mx-auto px-4 py-8">
      <Appbar />
      <h1 className="text-3xl font-bold mb-8">{blogPost.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{blogPost.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{blogPost.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={blogPost.author.avatar} alt={blogPost.author.name} />
                <AvatarFallback>{blogPost.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{blogPost.author.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(blogPost.publishedDate).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
