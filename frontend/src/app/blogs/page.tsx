"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Appbar from "@/components/component/Appbar";

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

export default function Blogs() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const token = sessionStorage.getItem("Token");
        const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlogPosts(response.data);
      } catch (error) {
        setError((error as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
   

         <Appbar ></Appbar>
        
        <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
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
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    
    <div className="container mx-auto px-4 py-8">
     
      
      <Appbar ></Appbar>
  
      <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{post.author.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(post.publishedDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
