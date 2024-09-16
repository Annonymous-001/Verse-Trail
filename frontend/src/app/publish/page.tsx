'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import { BACKEND_URL } from '../config';
import Appbar from '@/components/component/Appbar';

export default function Publish() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the token when the component mounts
    const retrievedToken = sessionStorage.getItem("Token");
    if (retrievedToken) {
      setToken(retrievedToken);
    }
  }, []);

  const handlePublish = async () => {
    if (!token) {
      console.error('Token is not available. Please log in.');
      alert('You must be logged in to publish a blog post.');
      return;
    }

    try {
      // Log the token and request data for debugging
      console.log('Publishing blog post with token:', token);
      console.log('Request data:', { title, content });

      // Make the POST request to the API
      const response = await axios.post(`${BACKEND_URL}/api/v1/blog/create`,
        { title, content }, // Payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Ensure content type is set
          },
        }
      );

      // Log the response data for debugging
      console.log('Response data:', response.data);
      
      // Handle successful post creation
      handleafterPublish();
    } catch (e) {
      // Log the error and alert the user
      console.error('Error publishing blog post:', e);
      alert('Failed to publish blog post. Please try again.');
    }
  };

  const handleafterPublish = () => {
    console.log('Publishing blog post:', { title, content });
    setTitle('');
    setContent('');
    alert('Blog post published successfully!');
  };

  return (
    <div className='m-2 mt-2'>
     <Appbar ></Appbar>
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-4xl border-2 border-black">
        <CardHeader className="bg-black text-white p-6">
          <CardTitle className="text-3xl font-bold">Create Your Blog Post</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-black">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title"
                required
                className="w-full text-lg py-3 px-4 border-2 border-black rounded-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-black">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your amazing content here..."
                rows={12}
                required
                className="w-full text-lg py-3 px-4 border-2 border-black rounded-none"
                />
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-white p-6">
          <Button 
            onClick={handlePublish} // Changed to handlePublish for direct publishing
            disabled={!title || !content}
            className="w-full py-3 text-lg bg-white text-black font-semibold rounded-none transition duration-300 ease-in-out hover:bg-black hover:text-black border-2 border-black"
            >
            Publish Your Post
          </Button>
        </CardFooter>
      </Card>
    </div>
            </div>
  );
}
